import { apiClient } from "./client";
import type {
  User,
  UpdateUserRequest,
  PaginatedResponse,
  ApiResponse,
} from "@/types/api";

export const userApi = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/me/profile");
    return response.data;
  },

  async updateUser(data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      "/me/profile/candidate",
      data
    );
    return response.data;
  },

  async getAllUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      `/user/list?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/user/${userId}`);
  },
};
