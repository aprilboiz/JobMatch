import { apiClient } from "./client";
import type {
  Job,
  JobResponse,
  JobRequest,
  PaginatedResponse,
  ApplicationResponse,
  ApiResponse,
  SalaryDto,
} from "@/types/api";

export interface JobSearchParams {
  keyword?: string;
  jobType?: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE";
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  companyName?: string;
  status?: "OPEN" | "CLOSED" | "EXPIRED";
  applicationDeadlineAfter?: string; // YYYY-MM-DD format
  page?: number;
  size?: number;
  sort?: string;
}

export const jobsApi = {
  // Get all jobs with pagination (public endpoint for candidates)
  async getAllJobs(
    page: number = 0,
    size: number = 10,
    sort: string = "createdAt,desc"
  ): Promise<PaginatedResponse<JobResponse>> {
    try {
      console.log(`🔄 Getting all jobs - page: ${page}, size: ${size}`);

      const response = await apiClient.get<any>(
        `/jobs?page=${page}&size=${size}&sort=${sort}`
      );

      console.log("📡 Raw API response:", response);
      console.log("📊 Response data:", response.data);

      // Handle backend response structure (similar to getMyJobs)
      if (response && response.data) {
        const backendData = response.data;

        // Check if it's wrapped in ApiResponse
        if (backendData.data && typeof backendData.data === "object") {
          const actualData = backendData.data;

          // Spring Boot pagination response: { content: [...], pageable: {...}, totalElements: ..., totalPages: ... }
          if (actualData.content && Array.isArray(actualData.content)) {
            const result = {
              data: actualData.content,
              total: actualData.totalElements || actualData.content.length,
              page: actualData.pageable?.pageNumber || 0,
              limit: actualData.pageable?.pageSize || actualData.content.length,
              totalPages: actualData.totalPages || 1,
            };
            console.log("✅ Parsed Spring Boot pagination response:", result);
            return result;
          }

          // If data is directly an array
          if (Array.isArray(actualData)) {
            const result = {
              data: actualData,
              total: actualData.length,
              page: 0,
              limit: actualData.length,
              totalPages: 1,
            };
            console.log("✅ Parsed array response:", result);
            return result;
          }
        }

        // Direct Spring Boot response without ApiResponse wrapper
        if (backendData.content && Array.isArray(backendData.content)) {
          const result = {
            data: backendData.content,
            total: backendData.totalElements || backendData.content.length,
            page: backendData.pageable?.pageNumber || 0,
            limit: backendData.pageable?.pageSize || backendData.content.length,
            totalPages: backendData.totalPages || 1,
          };
          console.log("✅ Parsed direct Spring Boot response:", result);
          return result;
        }

        // If data is directly an array
        if (Array.isArray(backendData)) {
          const result = {
            data: backendData,
            total: backendData.length,
            page: 0,
            limit: backendData.length,
            totalPages: 1,
          };
          console.log("✅ Parsed direct array response:", result);
          return result;
        }
      }

      console.error("❌ Unexpected response structure:", response);
      throw new Error("Invalid response structure");
    } catch (error: any) {
      console.error("❌ Error getting jobs:", error);
      console.error("📋 Error details:", error.response?.data);
      throw new Error(
        error?.message ||
          "Không thể tải danh sách việc làm. Vui lòng thử lại sau."
      );
    }
  },

  // Search and filter jobs (public endpoint for candidates)
  async searchJobs(
    params: JobSearchParams
  ): Promise<PaginatedResponse<JobResponse>> {
    try {
      console.log("Searching jobs with params:", params);

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.keyword) queryParams.append("keyword", params.keyword);
      if (params.jobType) queryParams.append("jobType", params.jobType);
      if (params.location) queryParams.append("location", params.location);
      if (params.minSalary)
        queryParams.append("minSalary", params.minSalary.toString());
      if (params.maxSalary)
        queryParams.append("maxSalary", params.maxSalary.toString());
      if (params.companyName)
        queryParams.append("companyName", params.companyName);
      if (params.status) queryParams.append("status", params.status);
      if (params.applicationDeadlineAfter) {
        queryParams.append(
          "applicationDeadlineAfter",
          params.applicationDeadlineAfter
        );
      }

      // Pagination and sorting
      queryParams.append("page", (params.page || 0).toString());
      queryParams.append("size", (params.size || 10).toString());
      queryParams.append("sort", params.sort || "createdAt,desc");

      const response = await apiClient.get<
        ApiResponse<PaginatedResponse<JobResponse>>
      >(`/jobs/search?${queryParams.toString()}`);

      console.log("Job search completed successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error searching jobs:", error);
      throw new Error(
        error?.message || "Không thể tìm kiếm việc làm. Vui lòng thử lại sau."
      );
    }
  },

  // Get job details by ID (public endpoint)
  async getJobById(id: number): Promise<JobResponse> {
    try {
      console.log(`Getting job details for ID: ${id}`);

      const response = await apiClient.get<ApiResponse<JobResponse>>(
        `/jobs/${id}`
      );

      console.log("Job details retrieved successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error getting job details:", error);

      if (error?.response?.status === 404) {
        throw new Error("Không tìm thấy việc làm này.");
      }

      throw new Error(
        error?.message ||
          "Không thể tải thông tin việc làm. Vui lòng thử lại sau."
      );
    }
  },

  // Get my jobs (recruiter's own jobs)
  async getMyJobs(): Promise<PaginatedResponse<Job>> {
    console.log("Get my jobs API call:", `/me/jobs`);

    const response = await apiClient.get<ApiResponse<any>>(`/me/jobs`);

    console.log("Get my jobs response:", response);

    // Handle backend response structure
    if (response && response.data) {
      const backendData = response.data;

      // Backend returns { content: [...], pageable: {...}, ... }
      if (backendData.content && Array.isArray(backendData.content)) {
        return {
          data: backendData.content,
          total: backendData.totalElements || backendData.content.length,
          page: backendData.pageable?.pageNumber || 0,
          limit: backendData.pageable?.pageSize || backendData.content.length,
          totalPages: backendData.totalPages || 1,
        };
      }

      // Fallback: if data is directly an array
      if (Array.isArray(backendData)) {
        return {
          data: backendData,
          total: backendData.length,
          page: 0,
          limit: backendData.length,
          totalPages: 1,
        };
      }
    }

    // Final fallback
    return {
      data: [],
      total: 0,
      page: 0,
      limit: 0,
      totalPages: 0,
    };
  },
  // Create new job (recruiter only)
  async createJob(data: JobRequest): Promise<Job> {
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
  async updateJob(jobId: number, data: Partial<JobRequest>): Promise<Job> {
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
