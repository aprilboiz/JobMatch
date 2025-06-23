import { apiClient } from "./client";
import type {
  Job,
  CreateJobRequest,
  PaginatedResponse,
  ApplicationResponse,
  ApiResponse,
  SalaryDto,
} from "@/types/api";

export const jobsApi = {
  // Get all jobs with pagination
  async getJobs(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Job>> {
    const searchParams = new URLSearchParams();

    if (params) {
      if (params.page !== undefined)
        searchParams.append("page", params.page.toString());
      if (params.size !== undefined)
        searchParams.append("size", params.size.toString());
    }

    const queryString = searchParams.toString();
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>(
      `/jobs${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Search and filter jobs
  async searchJobs(params?: {
    keyword?: string;
    jobType?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    companyName?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Job>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    console.log(
      "Search jobs API call:",
      `/jobs/search${queryString ? `?${queryString}` : ""}`
    );

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>(
      `/jobs/search${queryString ? `?${queryString}` : ""}`
    );

    console.log("Search jobs response:", response);

    // Handle different response structures
    if (response && response.data) {
      return response.data;
    } else if (response && Array.isArray(response)) {
      // If response is directly an array (not wrapped in ApiResponse)
      return {
        data: response,
        total: response.length,
        page: 0,
        limit: response.length,
        totalPages: 1,
      };
    } else {
      // Fallback
      return {
        data: [],
        total: 0,
        page: 0,
        limit: 0,
        totalPages: 0,
      };
    }
  },

  // Get job by ID
  async getJobById(jobId: number): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${jobId}`);
    return response.data;
  },

  // Create new job (recruiter only)
  async createJob(data: CreateJobRequest): Promise<Job> {
    console.log("Create job API call with data:", data);

    const response = await apiClient.post<ApiResponse<Job>>("/jobs", data);

    console.log("Create job response:", response);

    // Handle different response structures
    if (response && response.data) {
      return response.data;
    } else if (response && (response as any).id) {
      // If response is directly the job object (not wrapped in ApiResponse)
      return response as unknown as Job;
    } else {
      throw new Error("Invalid response structure from create job API");
    }
  },

  // Update job (recruiter only)
  async updateJob(
    jobId: number,
    data: Partial<CreateJobRequest>
  ): Promise<Job> {
    const response = await apiClient.put<ApiResponse<Job>>(
      `/jobs/${jobId}`,
      data
    );
    return response.data;
  },

  // Delete job (recruiter only)
  async deleteJob(jobId: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/jobs/${jobId}`);
  },

  // Get applications for a job (recruiter only)
  async getJobApplications(
    jobId: number,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<PaginatedResponse<ApplicationResponse>> {
    const searchParams = new URLSearchParams();

    if (params) {
      if (params.page !== undefined)
        searchParams.append("page", params.page.toString());
      if (params.size !== undefined)
        searchParams.append("size", params.size.toString());
    }

    const queryString = searchParams.toString();
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ApplicationResponse>>
    >(`/jobs/${jobId}/applications${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  // Get available job types
  async getJobTypes(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      "/jobs/job-types"
    );
    return response.data;
  },

  // Get available job statuses
  async getJobStatuses(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      "/jobs/job-statuses"
    );
    return response.data;
  },

  // Get filter options
  async getAvailableLocations(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      "/jobs/filter-options/locations"
    );
    return response.data;
  },

  async getAvailableCompanyNames(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      "/jobs/filter-options/companies"
    );
    return response.data;
  },
};
