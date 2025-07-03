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
  JobMatch,
  CandidateRanking,
  CandidateRankingItem,
  LogoutRequest
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

// API Client
class ApiClient {
  private baseURL: string
  private token: string | null = null

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
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle authentication errors
      if (response.status === 401) {
        this.clearToken()
        // Only redirect to login if we're not already on login/register pages
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname
          if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
            window.location.href = "/login"
          }
        }
        throw new ApiError("Authentication required", 401, "UNAUTHORIZED")
      }

      if (response.status === 403) {
        throw new ApiError("Access forbidden", 403, "FORBIDDEN")
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
    }
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

  async logout(logoutRequest: LogoutRequest): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST", body: JSON.stringify(logoutRequest) })
    } finally {
      // Always clear token, even if server request fails
      this.clearToken()
      Cookies.remove("auth_token")
      Cookies.remove("refresh_token")
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>("/me/profile")
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>("/me/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  // Job endpoints
  async getJobs(params?: {
    search?: string
    location?: string
    type?: string
    minSalary?: number
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return this.request<ApiResponse<PaginatedResponse<Job>>>(`/jobs?${searchParams.toString()}`)
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>(`/jobs/${id}`)
  }

  async createJob(jobData: Omit<Job, "id" | "postedDate" | "applicants" | "views" | "company">): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    })
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    })
  }

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/jobs/${id}`, { method: "DELETE" })
  }

  // Application endpoints
  async applyToJob(jobId: string, cvId: string, coverLetter?: string): Promise<ApiResponse<Application>> {
    return this.request<ApiResponse<Application>>("/applications", {
      method: "POST",
      body: JSON.stringify({ jobId, cvId, coverLetter }),
    })
  }

  async getApplications(params?: {
    status?: string
    jobId?: string
    candidateId?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<Application>>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return this.request<ApiResponse<PaginatedResponse<Application>>>(`/applications?${searchParams.toString()}`)
  }

  async updateApplicationStatus(id: string, status: Application["status"]): Promise<ApiResponse<Application>> {
    return this.request<ApiResponse<Application>>(`/applications/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  // CV endpoints
  async uploadCV(file: File): Promise<void> {
    const formData = new FormData()
    formData.append("file", file)

    await this.request("/cvs", {
      method: "POST",
      body: formData,
    })
  }

  async getCVs(): Promise<ApiResponse<CV[]>> {
    return this.request<ApiResponse<CV[]>>("/cvs")
  }

  async deleteCV(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/cvs/${id}`, { method: "DELETE" })
  }

  async analyzeCV(cvId: string): Promise<ApiResponse<CV["aiAnalysis"]>> {
    return this.request<ApiResponse<CV["aiAnalysis"]>>(`/cvs/${cvId}/analyze`, { method: "POST" })
  }

  async downloadCV(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/cvs/${id}/download`, {
      method: "GET",
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    if (!response.ok) throw new Error("Failed to download CV");
    return await response.blob();
  }

  // AI Scoring endpoints
  async getJobMatchScore(
    jobId: string,
    cvId: string,
  ): Promise<ApiResponse<JobMatchScore>> {
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
}

export const apiClient = new ApiClient(API_BASE_URL)
