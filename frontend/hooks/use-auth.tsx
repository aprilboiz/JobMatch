"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, AuthResponse } from "@/types/api";
import { authApi } from "@/lib/api/auth";
import { userApi } from "@/lib/api/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse & { user?: User }>;
  register: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: "CANDIDATE" | "RECRUITER" | "ADMIN";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (token) {
        // Check if token is expired
        const expiresIn =
          typeof window !== "undefined"
            ? localStorage.getItem("token_expires_in")
            : null;
        if (expiresIn) {
          const expirationTime = Number.parseInt(expiresIn) * 1000; // Convert to milliseconds
          const now = Date.now();

          if (now >= expirationTime) {
            // Token expired, try to refresh
            await authApi.refreshToken();
          }
        }

        const userData = await userApi.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Try to refresh token
      try {
        await authApi.refreshToken();
        const userData = await userApi.getCurrentUser();
        setUser(userData);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("token_expires_in");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse & { user?: User }> => {
    console.log("Starting login process...");

    const response = await authApi.login({ email, password });
    console.log("Login API response:", response);

    // Wait a bit to ensure token is properly set
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Now try to fetch user data with the new token
    try {
      console.log("Fetching user data after login...");
      const userData = await userApi.getCurrentUser();
      console.log("User data fetched:", userData);
      setUser(userData);

      // Return response with user data for immediate use
      return {
        ...response,
        user: userData,
      };
    } catch (error) {
      console.error("Failed to fetch user data after login:", error);

      // If fetching user data fails, we can still proceed with login
      // The user will be fetched later or on next page load
      console.warn("Proceeding without user data - will be fetched later");
      return response;
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: "CANDIDATE" | "RECRUITER" | "ADMIN";
  }) => {
    try {
      console.log("Starting registration process...");
      await authApi.register(data);
      console.log("Registration successful");
      // Register doesn't return user data, so we don't set user state
      // User will need to login after registration
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Re-throw to let the component handle it
    }
  };

  // const getCurrentUser = async () => {
  //   await
  // }

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
