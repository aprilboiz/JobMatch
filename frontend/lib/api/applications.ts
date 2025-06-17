import { apiClient } from "./client"
import type { ApplicationResponse, PaginatedResponse, ApiResponse } from "@/types/api"

export const applicationsApi = {
  async getCandidateApplications(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<PaginatedResponse<ApplicationResponse>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
      })
    }

    const queryString = searchParams.toString()
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ApplicationResponse>>>(
      `/candidate/applications${queryString ? `?${queryString}` : ""}`,
    )
    return response.data
  },

  async getRecruiterApplications(params?: {
    page?: number
    limit?: number
    status?: string
    jobId?: string
  }): Promise<PaginatedResponse<ApplicationResponse>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
      })
    }

    const queryString = searchParams.toString()
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ApplicationResponse>>>(
      `/recruiter/applications${queryString ? `?${queryString}` : ""}`,
    )
    return response.data
  },

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationResponse["status"],
    notes?: string,
  ): Promise<ApplicationResponse> {
    const response = await apiClient.put<ApiResponse<ApplicationResponse>>(`/applications/${applicationId}/status`, {
      status,
      notes,
    })
    return response.data
  },

  async scheduleInterview(applicationId: string, interviewDate: string): Promise<ApplicationResponse> {
    const response = await apiClient.put<ApiResponse<ApplicationResponse>>(`/applications/${applicationId}/interview`, {
      interviewDate,
    })
    return response.data
  },
}
