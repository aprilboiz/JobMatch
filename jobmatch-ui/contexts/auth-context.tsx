"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiClient } from "@/lib/api"
import { User, RegisterRequest, BaseProfileUpdateRequest } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import Cookies from "js-cookie"
import { t } from "@/lib/i18n-client"
import type { Dictionary } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, redirectTo?: string) => Promise<void>
  register: (userData: RegisterRequest, redirectTo?: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (userData: BaseProfileUpdateRequest) => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/settings", "/applications", "/jobs/apply"]

// Public routes that authenticated users shouldn't access
const PUBLIC_ONLY_ROUTES = ["/login", "/register"]

export function AuthProvider({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!user

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      if (isInitializing || isInitialized) return

      setIsInitializing(true)
      try {
        const token = Cookies.get("auth_token")
        if (token) {
          apiClient.setToken(token)
          const currentUser = await apiClient.getCurrentUser()
          if (currentUser.success) {
            setUser(currentUser.data)
          } else {
            throw new Error(currentUser.message)
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        // Clear invalid token
        Cookies.remove("auth_token")
        apiClient.clearToken()
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
        setIsInitializing(false)
      }
    }

    initAuth()
  }, [isInitializing, isInitialized])

  // Handle route protection and redirection
  useEffect(() => {
    if (!isInitialized || isLoggingIn) return

    console.log('Route protection check:', { pathname, isAuthenticated, user: user?.role?.roleName })

    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
    const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route))

    console.log('Route types:', { isProtectedRoute, isPublicOnlyRoute })

    if (isProtectedRoute && !isAuthenticated) {
      // Store the intended destination for after login
      console.log('Storing redirect for protected route:', pathname)
      localStorage.setItem("redirect_after_login", pathname)
      router.replace("/login")
    } else if (isPublicOnlyRoute && isAuthenticated) {
      // Redirect authenticated users away from login/register pages
      let redirectTo = localStorage.getItem("redirect_after_login")

      // If no specific redirect, use role-based default
      if (!redirectTo) {
        if (user?.role.roleName === "CANDIDATE") {
          redirectTo = "/jobs"
        } else {
          redirectTo = "/dashboard"
        }
      }

      console.log('Redirecting authenticated user from public route to:', redirectTo)
      localStorage.removeItem("redirect_after_login")
      router.replace(redirectTo)
    }
  }, [isAuthenticated, pathname, router, isInitialized, user, isLoggingIn])

  const checkAuth = async (): Promise<boolean> => {
    if (isInitializing) return false

    try {
      const token = Cookies.get("auth_token")
      if (!token) return false

      apiClient.setToken(token)
      const currentUser = await apiClient.getCurrentUser()
      if (currentUser.success) {
        setUser(currentUser.data)
      } else {
        throw new Error(currentUser.message)
      }
      return true
    } catch (error) {
      console.error("Auth check failed:", error)
      Cookies.remove("auth_token")
      apiClient.clearToken()
      setUser(null)
      return false
    }
  }

  const login = async (email: string, password: string, redirectTo?: string) => {
    try {
      setIsLoading(true)
      setIsLoggingIn(true)
      console.log('Login attempt with redirectTo:', redirectTo)
      const loginResponse = await apiClient.login({ email, password })

      // Login response only contains token, need to get user data separately
      const currentUserResponse = await apiClient.getCurrentUser()
      if (currentUserResponse.success) {
        setUser(currentUserResponse.data)
        console.log('User set, role:', currentUserResponse.data.role.roleName)
      } else {
        throw new Error(currentUserResponse.message)
      }

      toast({
        title: t(dictionary, 'auth.welcomeBack'),
        description: t(dictionary, 'auth.welcomeBackDescription'),
      })

      // Determine redirect destination based on user role
      let destination = redirectTo || localStorage.getItem("redirect_after_login")

      // If no specific redirect, use role-based default
      if (!destination) {
        if (currentUserResponse.data.role.roleName === "CANDIDATE") {
          destination = "/jobs"
        } else {
          destination = "/dashboard"
        }
      }

      console.log('Final destination:', destination)
      // Clear stored redirect
      localStorage.removeItem("redirect_after_login")

      // Use a small delay to ensure state updates are processed
      setTimeout(() => {
        router.replace(destination)
        setIsLoggingIn(false)
      }, 100)
    } catch (error) {
      console.error("Login error:", error)
      setIsLoggingIn(false)
      toast({
        variant: "destructive",
        title: t(dictionary, 'auth.loginFailed'),
        description: error instanceof Error ? error.message : t(dictionary, 'auth.incorrectCredentials'),
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest, redirectTo?: string) => {
    try {
      setIsLoading(true)
      const registerResponse = await apiClient.register(userData)

      toast({
        title: t(dictionary, 'auth.registerSuccessTitle'),
        description: registerResponse.message || t(dictionary, 'auth.registerSuccessDescription'),
      })

      // Determine redirect destination
      const destination = redirectTo || "/login"

      // Use replace to prevent back navigation to register page
      router.replace(destination)
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: t(dictionary, 'auth.registrationFailedTitle'),
        description: error instanceof Error ? error.message : t(dictionary, 'auth.registrationFailedDescription'),
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
      // Continue with logout even if server request fails
    } finally {
      // Clear local state regardless of server response
      setUser(null)
      apiClient.clearToken()

      // Clear all redirect-related keys from localStorage
      localStorage.removeItem("redirect_after_login")
      localStorage.removeItem("redirectTo")

      toast({
        title: t(dictionary, 'auth.signedOutTitle'),
        description: t(dictionary, 'auth.signedOutDescription'),
      })

      // Redirect to home page
      router.replace("/")
      setIsLoading(false)
    }
  }

  const updateProfile = async (userData: BaseProfileUpdateRequest) => {
    try {
      const response = await apiClient.updateProfile(userData)
      if (response.success) {
        setUser(response.data)
        toast({
          title: t(dictionary, 'profile.updateProfile'),
          description: response.message || t(dictionary, 'profile.updateProfileDescription'),
        })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
