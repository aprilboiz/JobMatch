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
