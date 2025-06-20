import { apiClient } from "./client";
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

      // Store tokens and set token in apiClient immediately
      apiClient.setToken(response.data.token);

      if (typeof window !== "undefined") {
        localStorage.setItem("refresh_token", response.data.refreshToken || "");
        localStorage.setItem(
          "token_expires_in",
          (response.data.expiresIn || 3600).toString()
        );
        console.log("Tokens stored in localStorage");
      }

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
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/refresh",
      {
        refreshToken,
      } as RefreshTokenRequest
    );

    // Update tokens and set new token in apiClient
    apiClient.setToken(response.data.token);
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", response.data.refreshToken);
      localStorage.setItem(
        "token_expires_in",
        response.data.expiresIn.toString()
      );
    }

    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    try {
      if (refreshToken && accessToken) {
        await apiClient.post<ApiResponse<void>>("/auth/logout", {
          accessToken,
          refreshToken,
        } as LogoutRequest);
      }
    } finally {
      // Clear tokens regardless of API response
      apiClient.clearToken();
    }
  },
};
