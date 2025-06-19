import { apiClient } from "./client";
import type { CompanyResponse, CompanyRequest, ApiResponse } from "@/types/api";

export const recruiterApi = {
  // Note: Backend doesn't have GET endpoint for company profile yet
  // This is a placeholder for when the endpoint is implemented
  async getCompanyProfile(): Promise<CompanyResponse> {
    throw new Error(
      "GET /me/company/profile endpoint not implemented in backend yet"
    );
  },
  // Update company profile (this works if recruiter has a company)
  async updateCompanyProfile(data: CompanyRequest): Promise<void> {
    try {
      await apiClient.put<ApiResponse<void>>("/me/company/profile", data);
    } catch (error: any) {
      console.error("Error updating company profile:", error);
      
      // Handle various error cases where recruiter doesn't have a company
      const errorMessage = error?.response?.data?.message || error?.message || "";
      
      if (
        error?.response?.status === 500 ||
        errorMessage.includes("Cannot invoke") ||
        errorMessage.includes("NullPointerException") ||
        errorMessage.includes("company is null") ||
        errorMessage.toLowerCase().includes("null")
      ) {
        throw new Error(
          "Tài khoản recruiter của bạn chưa được gán công ty. Vui lòng liên hệ quản trị viên để được hỗ trợ tạo thông tin công ty."
        );
      }
      
      // Handle other error types
      if (error?.response?.status === 400) {
        throw new Error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
      }
      
      if (error?.response?.status === 401) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
      
      if (error?.response?.status === 403) {
        throw new Error("Bạn không có quyền thực hiện thao tác này.");
      }
      
      // Default error message
      throw new Error(
        errorMessage || "Không thể cập nhật thông tin công ty. Vui lòng thử lại."
      );
    }
  },
};
