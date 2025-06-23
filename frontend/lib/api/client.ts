const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
    console.log("API Client initialized with base URL:", this.baseURL); // Debug log
  }

  private loadToken() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
      console.log("Token loaded:", this.token ? "Present" : "Not found"); // Debug log
    }
  }

  setToken(token: string) {
    console.log(
      "Setting token in ApiClient:",
      token ? "Token provided" : "No token"
    );
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      console.log("Token saved to localStorage");
    }
    console.log("Current token after set:", this.token ? "Present" : "Not set");
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_expires_in");
    }
    console.log("Tokens cleared"); // Debug log
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log("Making request to:", url); // Debug log

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log(
        "Authorization header added with token:",
        this.token.substring(0, 20) + "..."
      );
    } else {
      console.log("No token available for authorization");
    }

    console.log("Request headers:", headers); // Debug log
    console.log("Request body:", options.body); // Debug log

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log("Response status:", response.status); // Debug log
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      ); // Debug log

      // Handle 401 Unauthorized - token expired
      if (response.status === 401 && !endpoint.includes("/auth/")) {
        console.log("Received 401, attempting token refresh...");

        try {
          await this.refreshToken();
          console.log("Token refreshed successfully, retrying request...");

          // Retry the original request with new token
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${this.token}`,
          };

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            console.error("Retry request failed:", errorText);

            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = {
                message: errorText || `HTTP ${retryResponse.status}`,
              };
            }

            throw new Error(
              errorData.message || `HTTP ${retryResponse.status}`
            );
          }

          const responseText = await retryResponse.text();
          console.log("Retry request success:", responseText);

          const data = responseText ? JSON.parse(responseText) : {};
          return data;
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);

          // Clear tokens and redirect to login
          this.clearToken();

          // Redirect to login page
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }

          throw new Error(
            "Authentication failed. Please check your credentials and try again."
          );
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText); // Debug log

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Success response text:", responseText); // Debug log

      const data = responseText ? JSON.parse(responseText) : {};
      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  private async refreshToken(): Promise<void> {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("Attempting to refresh token...");

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    if (data && data.data) {
      // Update tokens
      this.setToken(data.data.token);

      if (typeof window !== "undefined") {
        localStorage.setItem("refresh_token", data.data.refreshToken);
        localStorage.setItem(
          "token_expires_in",
          data.data.expiresIn.toString()
        );
      }

      console.log("Token refreshed successfully");
    } else {
      throw new Error("Invalid refresh response");
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
