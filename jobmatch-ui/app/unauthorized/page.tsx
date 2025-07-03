"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()

  const handleGoHome = () => {
    if (user) {
      // If user is logged in, go to dashboard
      window.location.href = "/dashboard"
    } else {
      // If not logged in, go to home
      window.location.href = "/"
    }
  }

  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center p-4 min-h-96">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page. Please check your account permissions or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to {user ? "Dashboard" : "Home"}
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            {user && (
              <Button variant="outline" onClick={logout} className="w-full bg-transparent">
                Sign Out
              </Button>
            )}
          </div>
          {user && (
            <div className="text-sm text-muted-foreground">
              Logged in as: {user.email} ({user.role.roleName})
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
