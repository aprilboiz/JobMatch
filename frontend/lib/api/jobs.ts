import { apiClient } from "./client"
import type { Job, CreateJobRequest, PaginatedResponse, ApplicationResponse, ApiResponse } from "@/types/api"

export const jobsApi = {
  async getJobs(params?: {
    page?: number
    limit?: number
    location?: string
    salary?: string
    experience?: string
    search?: string
  }): Promise<PaginatedResponse<Job>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
      })
    }

    const queryString = searchParams.toString()
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>(
      `/jobs${queryString ? `?${queryString}` : ""}`,
    )
    return response.data
  },

  async getJobById(jobId: string): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${jobId}`)
    return response.data
  },

  async createJob(data: CreateJobRequest): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>("/jobs", data)
    return response.data
  },

  async updateJob(jobId: string, data: Partial<CreateJobRequest>): Promise<Job> {
    const response = await apiClient.put<ApiResponse<Job>>(`/jobs/${jobId}`, data)
    return response.data
  },

  async deleteJob(jobId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/jobs/${jobId}`)
  },

  async applyToJob(jobId: string, cvId?: string): Promise<ApplicationResponse> {
    const response = await apiClient.post<ApiResponse<ApplicationResponse>>(`/jobs/${jobId}/apply`, { cvId })
    return response.data
  },

  async getJobApplications(jobId: string): Promise<ApplicationResponse[]> {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>(`/jobs/${jobId}/applications`)
    return response.data
  },
}
