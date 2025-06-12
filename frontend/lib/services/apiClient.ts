// Trong file: lib/services/apiClient.ts
import axios from 'axios';
import { refreshTokenAPI } from './auth'; // Import từ file cùng thư mục

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  // ...
});

// Thêm Interceptor request để gắn token
apiClient.interceptors.request.use(
  (config) => {
    // ... (logic thêm header Authorization)
    return config;
  }
);

// Thêm Interceptor response để xử lý lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const localRefreshToken = localStorage.getItem('refreshToken');
        if (!localRefreshToken) throw new Error("No refresh token");

        const response = await refreshTokenAPI(localRefreshToken);
        const { accessToken, refreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Xóa token, chuyển hướng về trang đăng nhập
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
