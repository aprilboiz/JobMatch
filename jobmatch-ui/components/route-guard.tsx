"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: ("CANDIDATE" | "RECRUITER" | "ADMIN")[]
  fallbackPath?: string
}

export function RouteGuard({
  children,
  requireAuth = true,
  allowedRoles = [],
  fallbackPath,
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  // Extract locale from pathname
  const getLocaleFromPathname = (path: string): string => {
    const segments = path.split('/').filter(Boolean)
    return segments[0] || 'en' // Default to 'en' if no locale found
  }

  const locale = getLocaleFromPathname(pathname)

  // Generate locale-aware fallback path
  const getLocaleFallbackPath = (): string => {
    if (fallbackPath) {
      // If custom fallback path is provided, make sure it includes locale
      return fallbackPath.startsWith('/') ? `/${locale}${fallbackPath}` : `/${locale}/${fallbackPath}`
    }
    return `/${locale}/login`
  }

  useEffect(() => {
    // Don't check until auth context is fully loaded
    if (isLoading) {
      return
    }

    // If auth is required but user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      // Store current path for redirect after login
      localStorage.setItem("redirect_after_login", pathname)
      router.replace(getLocaleFallbackPath())
      return
    }

    // Check role permissions if authenticated and roles are specified
    if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
      if (!user || !allowedRoles.includes(user.role.roleName)) {
        router.replace(`/${locale}/unauthorized`)
        return
      }
    }

    // All checks passed
    setIsChecking(false)
  }, [isAuthenticated, isLoading, user?.role?.roleName, requireAuth, allowedRoles.join(','), pathname, locale, router])

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If role restrictions apply and user doesn't have required role, don't render children
  if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role.roleName)) {
      return null
    }
  }

  return <>{children}</>
}
