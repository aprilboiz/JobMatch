
import type { RegisterData, LoginData } from '@/lib/definitions';
import apiClient from './apiClient';


export async function register(data: RegisterData) {
  const res = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // ... (xử lý lỗi của bạn)
  }
  
  return res.json();
}

// Hàm đăng nhập cũng tương tự
export async function login(data: LoginData) {
  // Logic gọi API đăng nhập của bạn
  // Ví dụ:
  const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
  });
  // ...
}
export async function refreshTokenAPI(refreshToken: string) {
  const res = await fetch("http://localhost:8080/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Refresh token thất bại");
  }

  return res.json();
}


export async function logoutAPI(refreshToken: string) {
  return apiClient.post('/auth/logout', {
    refreshToken: refreshToken, // Backend của bạn cần trường này trong body
  });
}
