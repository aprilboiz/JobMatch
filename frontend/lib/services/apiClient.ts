// lib/services/apiClient.ts
import axios from 'axios';
import { refreshTokenAPI } from './auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Thêm Interceptor request để gắn token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
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
        if (!localRefreshToken) {
          throw new Error("No refresh token");
        }

        const response = await refreshTokenAPI(localRefreshToken);
        const { accessToken, refreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Cập nhật header cho request hiện tại
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Import authUtils để sử dụng forceLogout
        const { authUtils } = await import('./auth');
        authUtils.forceLogout();
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
