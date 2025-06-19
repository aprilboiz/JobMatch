import { apiClient } from "./client";
import type { CvResponse, ApplicationResponse, ApiResponse } from "@/types/api";
import {
  downloadFromResponse,
  triggerFileDownload,
  type DownloadResponse,
} from "@/lib/utils/file-download";

export const candidateApi = {
  // Upload CV file
  async uploadCV(file: File): Promise<CvResponse> {
    const response = await apiClient.uploadFile<ApiResponse<CvResponse>>(
      "/cvs",
      file
    );
    return response.data;
  },

  // Get all candidate CVs
  async getAllCVs(): Promise<CvResponse[]> {
    const response = await apiClient.get<ApiResponse<CvResponse[]>>("/cvs");
    return response.data;
  },

  // Get specific CV by ID
  async getCV(id: number): Promise<CvResponse> {
    const response = await apiClient.get<ApiResponse<CvResponse>>(`/cvs/${id}`);
    return response.data;
  },

  // Delete CV by ID
  async deleteCV(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/cvs/${id}`);
  },

  // Download CV file
  async downloadCV(id: number): Promise<DownloadResponse> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
      }/cvs/${id}/download`,
      {
        method: "GET",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return downloadFromResponse(response, `cv-${id}.pdf`);
  },

  // Download and save CV file directly
  async downloadAndSaveCV(id: number): Promise<void> {
    try {
      const { blob, filename } = await this.downloadCV(id);
      triggerFileDownload(blob, filename);
    } catch (error) {
      console.error("Failed to download CV:", error);
      throw error;
    }
  },

  // Get all candidate applications
  async getApplications(): Promise<ApplicationResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>(
        "/applications"
      );
      
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn("Applications API returned non-array data:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      throw error;
    }
  },
};
