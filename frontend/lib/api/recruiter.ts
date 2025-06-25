import { apiClient } from "./client";
import type {
  CompanyResponse,
  CompanyRequest,
  ApiResponse,
  UserResponse,
  UpdateRecruiterProfileRequest,
  JobResponse,
  ApplicationResponse,
  PaginatedResponse,
} from "@/types/api";

export const recruiterApi = {
  // Get user profile to extract company information
  async getUserProfile(): Promise<UserResponse> {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      "/me/profile"
    );
    return response.data;
  },

  // Since backend doesn't have GET /me/company, we'll use user profile
  // and try to get company info from there or return empty data
  async getCompanyProfile(): Promise<CompanyResponse | null> {
    try {
      const userProfile = await this.getUserProfile();

      // If user profile has company info, we could extract it here
      // For now, we'll return null to indicate no company data available
      console.log("User profile:", userProfile);

      // Return null since backend doesn't provide company details in user profile
      return null;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      return null;
    }
  },
  // Update company profile using the correct endpoint
  async updateCompanyProfile(data: CompanyRequest): Promise<void> {
    try {
      console.log("Updating company profile with data:", data);
      console.log("Calling PUT /me/company..."); // Try PUT method as defined in backend
      await apiClient.put<ApiResponse<void>>("/me/company", data);

      console.log("Company profile updated successfully");
    } catch (error: any) {
      console.error("Error updating company profile:", error);
      console.error("Error response:", error.response);

      // If PUT method not allowed, try POST
      if (error.response?.status === 405) {
        console.log("PUT method not allowed, trying POST...");
        try {
          await apiClient.post<ApiResponse<void>>("/me/company", data);
          console.log("Company profile updated successfully with POST");
          return;
        } catch (postError: any) {
          console.error("POST also failed:", postError);
        }
      } // Handle various error cases
      const errorMessage = error?.message || "";
      const status = error?.response?.status;
      const responseData = error?.response?.data;

      // Handle "Company not found" specifically
      if (
        responseData?.message === "Company not found" ||
        errorMessage.toLowerCase().includes("company not found")
      ) {
        throw new Error(
          "Tài khoản recruiter của bạn chưa được gán công ty. Vui lòng liên hệ quản trị viên để được hỗ trợ tạo thông tin công ty."
        );
      }

      if (status === 400) {
        throw new Error(
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập."
        );
      }

      if (status === 401) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      if (status === 403) {
        throw new Error("Bạn không có quyền cập nhật thông tin công ty này.");
      }
      if (status === 404) {
        throw new Error(
          "Tài khoản recruiter của bạn chưa được gán công ty. Vui lòng liên hệ quản trị viên để được hỗ trợ tạo thông tin công ty."
        );
      }

      if (status >= 500) {
        throw new Error(
          "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
        );
      }

      // Handle case where recruiter doesn't have a company
      if (
        errorMessage.includes("Cannot invoke") ||
        errorMessage.includes("NullPointerException") ||
        errorMessage.includes("company is null") ||
        errorMessage.toLowerCase().includes("null")
      ) {
        throw new Error(
          "Tài khoản recruiter của bạn chưa được gán công ty. Vui lòng liên hệ quản trị viên để được hỗ trợ tạo thông tin công ty."
        );
      }

      // Default error message
      throw new Error(
        errorMessage ||
          "Không thể cập nhật thông tin công ty. Vui lòng thử lại sau."
      );
    }
  },

  // Update recruiter profile with simplified fields
  async updateRecruiterProfile(
    data: UpdateRecruiterProfileRequest
  ): Promise<void> {
    try {
      console.log("Updating recruiter profile with data:", data);

      // Use the profile update endpoint
      await apiClient.put<ApiResponse<void>>("/me/profile/recruiter", data);

      console.log("Recruiter profile updated successfully");
    } catch (error: any) {
      console.error("Error updating recruiter profile:", error);

      const errorMessage = error?.message || "";
      const status = error?.response?.status;

      if (status === 400) {
        throw new Error(
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin."
        );
      }

      if (status === 401) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      if (status === 403) {
        throw new Error("Bạn không có quyền thực hiện thao tác này.");
      }

      if (status >= 500) {
        throw new Error(
          "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
        );
      }

      // Default error message
      throw new Error(
        errorMessage ||
          "Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau."
      );
    }
  },

  // Get all jobs posted by the recruiter
  async getRecruiterJobs(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<JobResponse>> {
    try {
      console.log(`Getting recruiter jobs - page: ${page}, size: ${size}`);

      const response = await apiClient.get<
        ApiResponse<PaginatedResponse<JobResponse>>
      >(`/me/jobs?page=${page}&size=${size}&sort=createdAt,desc`);

      console.log("Recruiter jobs retrieved successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error getting recruiter jobs:", error);

      const errorMessage = error?.message || "";
      const status = error?.response?.status;

      if (status === 401) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      if (status === 403) {
        throw new Error("Bạn không có quyền xem danh sách công việc này.");
      }

      if (status >= 500) {
        throw new Error(
          "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
        );
      }

      throw new Error(
        errorMessage ||
          "Không thể lấy danh sách công việc. Vui lòng thử lại sau."
      );
    }
  },

  // Get applications for a specific job
  async getJobApplications(
    jobId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<ApplicationResponse>> {
    try {
      console.log(
        `Getting applications for job ${jobId} - page: ${page}, size: ${size}`
      );

      const response = await apiClient.get<
        ApiResponse<PaginatedResponse<ApplicationResponse>>
      >(
        `/jobs/${jobId}/applications?page=${page}&size=${size}&sort=appliedAt,desc`
      );

      console.log("Job applications retrieved successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error getting job applications:", error);

      const errorMessage = error?.message || "";
      const status = error?.response?.status;

      if (status === 401) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      if (status === 403) {
        throw new Error("Bạn không có quyền xem danh sách ứng tuyển này.");
      }

      if (status === 404) {
        throw new Error("Không tìm thấy công việc này.");
      }

      if (status >= 500) {
        throw new Error(
          "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
        );
      }

      throw new Error(
        errorMessage ||
          "Không thể lấy danh sách ứng tuyển. Vui lòng thử lại sau."
      );
    }
  },
  // Get all applications for all jobs of the recruiter's company
  async getAllCompanyApplications(
    pageSize: number = 20
  ): Promise<ApplicationResponse[]> {
    try {
      console.log("Getting all applications for company jobs...");

      // Step 1: Get all jobs for the recruiter
      const allJobs: JobResponse[] = [];
      let currentPage = 0;
      let hasMoreJobs = true;

      while (hasMoreJobs) {
        const jobsResponse = await this.getRecruiterJobs(currentPage, pageSize);
        allJobs.push(...jobsResponse.data);

        // Check if there are more pages
        hasMoreJobs = currentPage < jobsResponse.totalPages - 1;
        currentPage++;
      }

      console.log(`Found ${allJobs.length} jobs for recruiter`);

      // Step 2: Get all applications for each job
      const allApplications: ApplicationResponse[] = [];

      for (const job of allJobs) {
        try {
          let currentAppPage = 0;
          let hasMoreApps = true;

          while (hasMoreApps) {
            const appsResponse = await this.getJobApplications(
              job.id,
              currentAppPage,
              pageSize
            );

            allApplications.push(...appsResponse.data);

            // Check if there are more pages
            hasMoreApps = currentAppPage < appsResponse.totalPages - 1;
            currentAppPage++;
          }
        } catch (error) {
          console.warn(`Failed to get applications for job ${job.id}:`, error);
          // Continue with other jobs even if one fails
        }
      }

      console.log(`Retrieved ${allApplications.length} total applications`);

      // Sort by application date (newest first)
      allApplications.sort(
        (a, b) =>
          new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
      );

      return allApplications;
    } catch (error: any) {
      console.error("Error getting all company applications:", error);

      const errorMessage = error?.message || "";

      if (errorMessage.includes("đăng nhập")) {
        throw error; // Re-throw login errors as-is
      }

      throw new Error(
        errorMessage ||
          "Không thể lấy danh sách ứng tuyển của công ty. Vui lòng thử lại sau."
      );
    }
  },
};
