import Cookies from 'js-cookie';

export async function login(email: string, password: string) {
  const res = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Đăng nhập thất bại");
  }

  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch("http://localhost:8080/api/me/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("accessToken") || localStorage.getItem("accessToken")}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Lấy thông tin người dùng thất bại");
  }

  return res.json();
}

// --- THÊM LOGOUT FUNCTION ---
export async function logout() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // Nếu không có token, vẫn clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return { success: true, message: "Đăng xuất thành công" };
  }

  try {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        token: token,
        // Có thể thêm userId nếu backend cần
      }),
    });

    // Clear localStorage bất kể response như thế nào
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.warn("Logout API failed:", error);
      // Vẫn return success vì đã clear localStorage
      return { success: true, message: "Đăng xuất thành công" };
    }

    const result = await res.json();
    return { success: true, message: result.message || "Đăng xuất thành công" };
    
  } catch (error) {
    console.error("Logout error:", error);
    // Vẫn clear localStorage ngay cả khi API call thất bại
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return { success: true, message: "Đăng xuất thành công" };
  }
}

// --- CẢI THIỆN REGISTER FUNCTION ---
export async function register(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}) {
  const res = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Đã xảy ra lỗi không xác định" }));
    
    class RegisterError extends Error {
      status: number;
      errors: Record<string, any>;
      constructor(message: string, status: number, errors: Record<string, any>) {
        super(message);
        this.name = "RegisterError";
        this.status = status;
        this.errors = errors;
      }
    }

    throw new RegisterError(
      errorData.message || "Đăng ký thất bại",
      res.status,
      errorData.errors || {}
    );
  }

  return res.json();
}

// --- THÊM REFRESH TOKEN FUNCTION ---
export async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    throw new Error("Không có refresh token");
  }

  const res = await fetch("http://localhost:8080/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    // Refresh token hết hạn, clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  const result = await res.json();
  
  if (result.data?.token) {
    localStorage.setItem("token", result.data.token);
    if (result.data.refreshToken) {
      localStorage.setItem("refreshToken", result.data.refreshToken);
    }
  }

  return result;
}

// --- THÊM API CLIENT WITH AUTO RETRY ---
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  let res = await fetch(`http://localhost:8080/api${endpoint}`, defaultOptions);

  // Nếu token hết hạn (401), thử refresh
  if (res.status === 401 && token) {
    try {
      await refreshToken();
      
      // Retry với token mới
      const newToken = localStorage.getItem("token");
      const retryOptions = {
        ...defaultOptions,
        headers: {
          ...defaultOptions.headers,
          Authorization: `Bearer ${newToken}`,
        },
      };
      
      res = await fetch(`http://localhost:8080/api${endpoint}`, retryOptions);
    } catch (refreshError) {
      // Refresh thất bại, redirect về login
      window.location.href = "/auth/login";
      throw new Error("Phiên đăng nhập đã hết hạn");
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API call failed");
  }

  return res.json();
}
