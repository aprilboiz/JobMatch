import type { RegisterData, LoginData } from '@/lib/definitions';
import apiClient from './apiClient';
import Cookies from 'js-cookie';


export async function register(data: RegisterData) {
  const res = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Đăng ký thất bại');
  }
  
  return res.json();
}

// Hàm đăng nhập - cập nhật để set cookies
export async function login(data: LoginData) {
  const res = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Đăng nhập thất bại');
  }

  const result = await res.json();

  if (result.accessToken && result.refreshToken) {
    // Đồng bộ set cookies và localStorage
    const cookieOptions = {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    // Set cookies
    Cookies.set('accessToken', result.accessToken, cookieOptions);
    Cookies.set('refreshToken', result.refreshToken, { ...cookieOptions, expires: 7 });

    // Set localStorage
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    
    if (result.user) {
      localStorage.setItem('userInfo', JSON.stringify(result.user));
    }

    // Verify cookies được set
    console.log('Cookies set:', {
      accessToken: Cookies.get('accessToken'),
      refreshToken: Cookies.get('refreshToken')
    });
  }

  return result;
}

// Hàm refresh token - cập nhật để set cookies
export async function refreshTokenAPI(refreshToken: string) {
  const res = await fetch("http://localhost:8080/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Refresh token thất bại");
  }

  const result = await res.json();

  // Cập nhật tokens mới vào cookies và localStorage
  if (result.accessToken && result.refreshToken) {
    Cookies.set('accessToken', result.accessToken, { 
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    Cookies.set('refreshToken', result.refreshToken, { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
  }

  return result;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

// API logout function - bỏ qua interceptor
export const logoutAPI = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/logout', {
      refreshToken: refreshToken
    }, {
      skipAuthRefresh: true
    } as any);
    
    return response.data;
  } catch (error: any) {
    // Nếu lỗi 401 trong logout thì vẫn coi là thành công
    if (error.response?.status === 401) {
      return { success: true, message: "Logout successful" };
    }
    throw error;
  }
};

// Auth utilities - cập nhật để sử dụng cookies
export const authUtils = {
  // Lấy token từ cookies trước, localStorage làm backup
  getAccessToken: (): string | null => {
    return Cookies.get('accessToken') || localStorage.getItem('accessToken');
  },
  
  getRefreshToken: (): string | null => {
    return Cookies.get('refreshToken') || localStorage.getItem('refreshToken');
  },
  
  // Set tokens vào cả cookies và localStorage
  setTokens: (accessToken: string, refreshToken: string) => {
    // Set cookies để middleware có thể đọc
    Cookies.set('accessToken', accessToken, { 
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    Cookies.set('refreshToken', refreshToken, { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    // Backup trong localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  // Xóa tokens khỏi cả cookies và localStorage
  clearTokens: (): void => {
    // Xóa cookies
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    
    // Xóa localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    
    // Xóa Authorization header
    delete apiClient.defaults.headers.common['Authorization'];
  },
  
  isAuthenticated: (): boolean => {
    return !!(authUtils.getAccessToken());
  },
  
  // Logout function được cải thiện
  logout: async (): Promise<boolean> => {
    try {
      const refreshToken = authUtils.getRefreshToken();
      
      if (refreshToken) {
        // Gọi API logout, không quan tâm kết quả
        await logoutAPI(refreshToken).catch(() => {
          console.log('Logout API failed, but continuing with local cleanup');
        });
      }
      
      // Luôn xóa tokens dù API có lỗi hay không
      authUtils.clearTokens();
      return true;
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Logout error:', error.message);
      } else {
        console.error('Unknown logout error:', String(error));
      }
      
      // Vẫn xóa tokens local dù API lỗi
      authUtils.clearTokens();
      return true;
    }
  },
  
  forceLogout: (): void => {
    authUtils.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
};
