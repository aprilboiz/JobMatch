import apiClient from './apiClient';
import axios from 'axios';
import { authUtils } from './auth';

export interface CvResponse {
  id: number;
  fileName: string;
  fileUri: string;
  uploadDate: string;
  fileSize: number;
}

export interface ApplicationResponse {
  id: number;
  jobTitle: string;
  companyName: string;
  appliedDate: string;
  status: string;
  matchingScore?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class CandidateService {
  
  private handleApiError(error: unknown): never {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 401) {
        authUtils.forceLogout();
        throw new Error('Authentication failed. Please login again.');
      }
    }
    throw error;
  }
  

  async uploadCv(file: File): Promise<CvResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<ApiResponse<CvResponse>>('/me/cvs', formData);
      
      return response.data.data;
    } catch (error) {
      this.handleApiError(error); // TypeScript biết đây là 'never'
    }
  }
  
  async getAllCvs(): Promise<CvResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<CvResponse[]>>('/me/cvs');
      console.log('API response:', response.data); // Debug log
      return response.data.data; // ← Đảm bảo có return
    } catch (error) {
      this.handleApiError(error);
      // handleApiError throws error, nên không cần return ở đây
    }
  }
  
  async getCv(id: number): Promise<CvResponse> {
    try {
      const response = await apiClient.get<ApiResponse<CvResponse>>(`/me/cvs/${id}`);
      return response.data.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }
  
  async deleteCv(id: number): Promise<void> {
    try {
      await apiClient.delete(`/me/cvs/${id}`);
    } catch (error) {
      this.handleApiError(error);
    }
  }
  
  async downloadCv(id: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`/me/cvs/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }
  
  async getAllApplications(): Promise<ApplicationResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>('/me/applications');
      return response.data.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }
}
export const candidateService = new CandidateService();
