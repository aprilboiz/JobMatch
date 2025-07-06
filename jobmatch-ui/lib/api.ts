"use client"

import {
  User,
  Job,
  Application,
  CV,
  Company,
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  AuthResponse,
  PaginatedResponse,
  JobMatchScore,
  CandidateRanking,
  CompanyRequest,
  BaseProfileUpdateRequest,
  Pageable,
  JobRequest,
  JobCategory,
  CandidateWithApplication,
} from "./types"
import Cookies from "js-cookie"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Request logging utility for debugging
let requestCounter = 0
const logRequest = (method: string, url: string, isRetry?: boolean) => {
  if (process.env.NODE_ENV === 'development') {
    requestCounter++
    console.log(`🔄 API [${requestCounter}] ${method.toUpperCase()} ${url}${isRetry ? ' (retry)' : ''}`)
  }
}

// API Client
class ApiClient {
  private baseURL: string
  private token: string | null = null
  private pendingRequests: Map<string, Promise<any>> = new Map()

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = Cookies.get("auth_token") || null
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      Cookies.set("auth_token", token, { secure: true, sameSite: "strict" })
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      Cookies.remove("auth_token")
    }
    // Clear any pending requests when token is cleared
    this.pendingRequests.clear()
  }

  clearPendingRequests() {
    this.pendingRequests.clear()
  }

  private async refreshToken() {
    const url = `${this.baseURL}/auth/refresh`

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
      })

      if (response.status === 401) {
        this.clearToken()
        // redirect to the login page since the refresh token is expired
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname
          if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
            window.location.href = "/login"
          }
        }
        throw new ApiError("Authentication required", 401, "UNAUTHORIZED")
      }

      if (!response.ok) {
        throw new ApiError("Failed to refresh token", response.status)
      }

      const responseData = await response.json()
      this.setToken(responseData.data.token)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new ApiError("Network error. Please check your connection.", 0, "NETWORK_ERROR")
      }

      throw new ApiError("An unexpected error occurred", 500, "UNKNOWN_ERROR")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const isRetry = !!(options.headers as any)?.['X-Retry-Attempted']

    // Create a unique key for this request
    const requestKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || '')}`

    // Check if the same request is already pending (except for retry attempts)
    if (!isRetry && this.pendingRequests.has(requestKey)) {
      logRequest(options.method || 'GET', endpoint + ' (deduplicated)', isRetry)
      return this.pendingRequests.get(requestKey)!
    }

    // Log the request for debugging
    logRequest(options.method || 'GET', endpoint, isRetry)

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Pending requests: ${this.pendingRequests.size}`)
    }

    let headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Only set Content-Type if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        })

        // Handle authentication errors
        if (response.status === 401) {
          // Avoid retry for login endpoint to prevent loops
          if (endpoint.includes('/auth/login')) {
            const error = await response.json().catch(() => ({
              message: `HTTP ${response.status}: ${response.statusText}`,
            }))
            throw new ApiError(error.message || `HTTP ${response.status}`, response.status, error.code, error.errors)
          }

          // Only retry once for other endpoints
          if (!options.headers || !(options.headers as any)['X-Retry-Attempted']) {
            // Remove from pending requests before retry
            this.pendingRequests.delete(requestKey)
            await this.refreshToken()
            return await this.request<T>(endpoint, {
              ...options,
              headers: {
                ...headers,
                'X-Retry-Attempted': 'true'
              }
            })
          }

          // If retry also failed, throw error
          throw new ApiError("Authentication required", 401, "UNAUTHORIZED")
        }

        if (response.status === 403) {
          let responseData: ApiResponse<any> = {
            success: false,
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: new Date().toISOString(),
            data: null
          }
          try {
            responseData = await response.json()
          } catch {
            // fallback already set above
          }
          throw new ApiError(
            responseData.message || "Access denied. You don't have permission to access this resource",
            403,
            undefined,
            undefined
          )
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }))
          throw new ApiError(error.message || `HTTP ${response.status}`, response.status, error.code, error.errors)
        }

        // Handle empty responses
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          return response.json()
        } else {
          return {} as T
        }
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes("fetch")) {
          throw new ApiError("Network error. Please check your connection.", 0, "NETWORK_ERROR")
        }

        throw new ApiError("An unexpected error occurred", 500, "UNKNOWN_ERROR")
      } finally {
        // Remove from pending requests when done
        this.pendingRequests.delete(requestKey)
      }
    })()

    // Store the promise for deduplication
    this.pendingRequests.set(requestKey, requestPromise)

    return requestPromise
  }

  private buildSearchParams(params: Record<string, any>): URLSearchParams {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => {
            if (v !== undefined && v !== null) {
              searchParams.append(key, v.toString())
            }
          })
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })
    return searchParams
  }

  // Auth endpoints
  async login(loginRequest: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(loginRequest),
    })

    // Set token immediately after successful login
    this.setToken(response.data.token)
    return response
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<null>> {
    const response = await this.request<ApiResponse<null>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" })
    } finally {
      // Always clear token, even if server request fails
      this.clearToken()
      Cookies.remove("auth_token")
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>("/me/profile")
  }

  async updateProfile(userData: BaseProfileUpdateRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>("/me/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  // Job endpoints
  async getJobs(params: Pageable & {
    keyword?: string
    jobType?: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE"
    jobCategory?: number
    location?: string
    minSalary?: number
    maxSalary?: number
    companyName?: string
    status?: "OPEN" | "CLOSED" | "EXPIRED"
    applicationDeadlineAfter?: string
  } = {}): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const searchParams = this.buildSearchParams(params)
    return this.request<ApiResponse<PaginatedResponse<Job>>>(`/jobs?${searchParams.toString()}`)
  }

  async getRecruiterJobs(params: Pageable): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const searchParams = this.buildSearchParams(params)
    return this.request<ApiResponse<PaginatedResponse<Job>>>(`/me/jobs?${searchParams.toString()}`)
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>(`/jobs/${id}`)
  }

  async createJob(jobData: JobRequest): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    })
  }

  async updateJob(id: string, jobData: JobRequest): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    })
  }

  async deleteJob(id: string): Promise<void> {
    await this.request(`/jobs/${id}`, { method: "DELETE" })
  }

  async searchJobs(params: {
    keyword?: string
    jobType?: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE"
    jobCategory?: number
    location?: string
    minSalary?: number
    maxSalary?: number
    companyName?: string
    status?: "OPEN" | "CLOSED" | "EXPIRED"
    applicationDeadlineAfter?: string
    page?: number
    size?: number
    sort?: string[]
  }): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const searchParams = this.buildSearchParams(params)
    return this.request<ApiResponse<PaginatedResponse<Job>>>(`/jobs/search?${searchParams}`)
  }

  async getJobTypes(): Promise<ApiResponse<string[]>> {
    return this.request<ApiResponse<string[]>>(`/jobs/job-types`)
  }

  async getJobStatuses(): Promise<ApiResponse<string[]>> {
    return this.request<ApiResponse<string[]>>("/jobs/job-statuses")
  }

  async getJobCategories(): Promise<ApiResponse<JobCategory[]>> {
    return this.request<ApiResponse<JobCategory[]>>("/jobs/job-categories")
  }

  async getAvailableLocations(): Promise<ApiResponse<string[]>> {
    return this.request<ApiResponse<string[]>>(`/jobs/filter-options/locations`)
  }

  async getAvailableCompanyNames(): Promise<ApiResponse<string[]>> {
    return this.request<ApiResponse<string[]>>(`/jobs/filter-options/companies`)
  }

  // Application endpoints
  async getApplications(params: Pageable): Promise<ApiResponse<PaginatedResponse<Application>>> {
    const searchParams = this.buildSearchParams(params)
    return this.request<ApiResponse<PaginatedResponse<Application>>>(`/applications?${searchParams.toString()}`)
  }

  async getApplication(id: string): Promise<ApiResponse<Application>> {
    return this.request<ApiResponse<Application>>(`/applications/${id}`)
  }

  async getApplicationForRecruiter(id: string): Promise<ApiResponse<Application>> {
    return this.request<ApiResponse<Application>>(`/me/applications/${id}`)
  }

  async getApplicationsForJob(jobId: string, params: Pageable): Promise<ApiResponse<PaginatedResponse<CandidateWithApplication>>> {
    const searchParams = this.buildSearchParams(params)
    return this.request<ApiResponse<PaginatedResponse<CandidateWithApplication>>>(`/jobs/${jobId}/applications?${searchParams.toString()}`)
  }

  async createApplication(applicationData: { jobId: string; cvId: string; coverLetter?: string }): Promise<ApiResponse<Application>> {
    return this.request<ApiResponse<Application>>("/applications", {
      method: "POST",
      body: JSON.stringify(applicationData),
    })
  }

  async updateApplicationStatus(id: string, status: Application["status"]): Promise<ApiResponse<Application>> {
    try {
      const response = await this.request<ApiResponse<Application>>(`/applications/${id}/status?status=${status}`, {
        method: "PUT",
      })
      if (!response.success) {
        console.log(response)
        throw new ApiError(response.message || "Failed to update application status", 400)
      }
      return response
    } catch (error: any) {
      console.log(error)
      throw new ApiError(error.message || "Failed to update application status", 400, error.code, error.errors)
    }
  }

  async withdrawApplication(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/applications/${id}`, { method: "DELETE" })
  }

  // CV endpoints
  async uploadCV(file: File): Promise<ApiResponse<CV>> {
    const formData = new FormData()
    formData.append("file", file)
    return this.request<ApiResponse<CV>>("/cvs", {
      method: "POST",
      body: formData,
    })
  }

  async getCVs(): Promise<ApiResponse<CV[]>> {
    return this.request<ApiResponse<CV[]>>("/cvs")
  }

  async getCV(id: string): Promise<ApiResponse<CV>> {
    return this.request<ApiResponse<CV>>(`/cvs/${id}`)
  }

  async deleteCV(id: string): Promise<ApiResponse<string>> {
    return this.request<ApiResponse<string>>(`/cvs/${id}`, { method: "DELETE" })
  }

  async restoreCV(id: string): Promise<ApiResponse<string>> {
    return this.request<ApiResponse<string>>(`/cvs/${id}/restore`, { method: "POST" })
  }

  async getDeletedCVs(): Promise<ApiResponse<CV[]>> {
    return this.request<ApiResponse<CV[]>>("/cvs/deleted")
  }

  async downloadCV(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/cvs/${id}/download`, {
      method: "GET",
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    })
    if (!response.ok) throw new Error("Failed to download CV")
    return await response.blob()
  }

  // Image Management endpoints
  async uploadUserAvatar(userId: string, avatar: File): Promise<ApiResponse<void>> {
    const formData = new FormData()
    formData.append("avatar", avatar)
    return this.request<ApiResponse<void>>(`/users/${userId}/avatar`, {
      method: "POST",
      body: formData,
    })
  }

  // Language Management endpoints
  async getSupportedLanguages(): Promise<ApiResponse<Record<string, string>>> {
    return this.request<ApiResponse<Record<string, string>>>("/language/supported")
  }

  async getCurrentLanguage(): Promise<ApiResponse<Record<string, string>>> {
    return this.request<ApiResponse<Record<string, string>>>("/language/current")
  }

  async switchLanguage(lang: string): Promise<ApiResponse<Record<string, string>>> {
    return this.request<ApiResponse<Record<string, string>>>(`/language/switch?lang=${lang}`, {
      method: "POST",
    })
  }

  // AI endpoints
  async getJobMatchScore(jobId: string, cvId: string): Promise<ApiResponse<JobMatchScore>> {
    return this.request<ApiResponse<JobMatchScore>>(`/ai/match-score?jobId=${jobId}&cvId=${cvId}`)
  }

  async getCandidateRanking(jobId: string): Promise<ApiResponse<CandidateRanking>> {
    return this.request<ApiResponse<CandidateRanking>>(`/ai/candidate-ranking/${jobId}`)
  }

  // Company endpoints
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    return this.request<ApiResponse<Company[]>>("/companies")
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return this.request<ApiResponse<Company>>(`/companies/${id}`)
  }

  async createCompany(companyData: Omit<Company, "id">): Promise<ApiResponse<Company>> {
    return this.request<ApiResponse<Company>>("/companies", {
      method: "POST",
      body: JSON.stringify(companyData),
    })
  }

  async updateCompany(id: string, companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    return this.request<ApiResponse<Company>>(`/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(companyData),
    })
  }

  async updateCompanyProfile(companyData: CompanyRequest): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>("/me/company", {
      method: "PUT",
      body: JSON.stringify(companyData),
    })
  }

  async uploadCompanyLogo(companyId: string, logo: File): Promise<ApiResponse<void>> {
    const formData = new FormData()
    formData.append("logo", logo)
    return this.request<ApiResponse<void>>(`/companies/${companyId}/logo`, {
      method: "POST",
      body: formData,
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
