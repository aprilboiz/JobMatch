import { apiClient } from "./client"
import type { CvResponse, ApplicationResponse, ApiResponse } from "@/types/api"

export const candidateApi = {
  // Upload CV file
  async uploadCV(file: File): Promise<CvResponse> {
    const response = await apiClient.uploadFile<ApiResponse<CvResponse>>("/me/cvs", file)
    return response.data
  },

  // Get all candidate CVs
  async getAllCVs(): Promise<CvResponse[]> {
    const response = await apiClient.get<ApiResponse<CvResponse[]>>("/me/cvs")
    return response.data
  },

  // Get specific CV by ID
  async getCV(id: number): Promise<CvResponse> {
    const response = await apiClient.get<ApiResponse<CvResponse>>(`/me/cvs/${id}`)
    return response.data
  },

  // Delete CV by ID
  async deleteCV(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/me/cvs/${id}`)
  },

  // Download CV file
  async downloadCV(id: number): Promise<Blob> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/me/cvs/${id}/download`,
      {
        method: "GET",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to download CV")
    }

    return response.blob()
  },

  // Get all candidate applications
  async getApplications(): Promise<ApplicationResponse[]> {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>("/me/applications")
    return response.data
  },
}
