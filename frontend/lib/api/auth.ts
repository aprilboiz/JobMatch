import { apiClient } from "./client";
import { TokenManager } from "@/lib/utils/token-manager";
import type {
  AuthResponse,
  AuthRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ApiResponse,
} from "@/types/api";

export const authApi = {
  async register(data: RegisterRequest): Promise<void> {
    console.log("Register request:", data); // Debug log

    // Make register request without authorization header
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
      }/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Register error response:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `HTTP ${response.status}` };
      }

      // Handle specific register errors
      if (response.status === 409) {
        throw new Error("Email đã được sử dụng. Vui lòng chọn email khác.");
      } else if (response.status === 400) {
        throw new Error(errorData.message || "Thông tin đăng ký không hợp lệ");
      }

      throw new Error(
        errorData.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    }

    console.log("Register successful");
    // Register endpoint returns void, no tokens to store
  },

  async login(data: AuthRequest): Promise<AuthResponse> {
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Login request data:", data);
    console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL);

    try {
      // Make the login request
      console.log("Making login request to /auth/login...");
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        data
      );
      console.log("Raw login response:", response);

      // Validate response structure
      if (!response || !response.data) {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response from server");
      }

      if (!response.data.token) {
        console.error("No access token in response:", response.data);
        throw new Error("No access token received");
      }
      console.log("Login successful, setting token...");
      console.log(
        "Access token (first 20 chars):",
        response.data.token.substring(0, 20) + "..."
      );

      // Store tokens using TokenManager and set token in apiClient
      apiClient.setToken(
        response.data.token,
        response.data.refreshToken,
        response.data.expiresIn || 3600
      );

      console.log("Tokens stored using TokenManager");
      console.log("=== LOGIN SUCCESS ===");
      return response.data;
    } catch (error) {
      console.error("=== LOGIN FAILED ===");
      console.error("Login error:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Authentication failed")) {
          throw new Error("Email hoặc mật khẩu không đúng");
        } else if (error.message.includes("Network")) {
          throw new Error("Không thể kết nối đến server");
        }
      }

      throw error;
    }
  },
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = TokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/refresh",
      {
        refreshToken,
      } as RefreshTokenRequest
    );

    // Update tokens using TokenManager and set new token in apiClient
    apiClient.setToken(
      response.data.token,
      response.data.refreshToken,
      response.data.expiresIn
    );

    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken();
    const accessToken = TokenManager.getAccessToken();

    try {
      // Only attempt API logout if we have valid tokens
      if (refreshToken && accessToken && !TokenManager.isTokenExpired()) {
        await apiClient.post<ApiResponse<void>>("/auth/logout", {
          accessToken,
          refreshToken,
        } as LogoutRequest);
      } else {
        console.log("Skipping API logout - no valid tokens available");
      }
    } catch (error) {
      // Log error but don't throw - we still want to clear local tokens
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear tokens regardless of API response
      apiClient.clearToken();
    }
  },
};
