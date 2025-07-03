"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Briefcase, User, Building2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { ApiError } from "@/lib/api"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "" as "CANDIDATE" | "RECRUITER" | "",
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get("redirect") || "/login"

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const destination = localStorage.getItem("redirect_after_login") || redirectTo
      localStorage.removeItem("redirect_after_login")
      router.replace(destination)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrors({})

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions")
      return
    }

    if (!formData.role) {
      setError("Please select your role")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsSubmitting(true)

    try {
      await register(
        {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          role: formData.role as "CANDIDATE" | "RECRUITER",
        },
        redirectTo,
      )
      // Redirection is handled in the register function
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      setErrors(err instanceof ApiError ? err.errors || {} : {})
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render the form if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center p-4 min-h-96">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg transform rotate-3">
                <Briefcase className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Join JobMatch</CardTitle>
            <CardDescription>Create your account and start your career journey</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CANDIDATE">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Job Seeker
                      </div>
                    </SelectItem>
                    <SelectItem value="RECRUITER">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        Recruiter/Employer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">
                    {Array.isArray(errors.role) ? errors.role.join(", ") : errors.role}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {Array.isArray(errors.fullName) ? errors.fullName.join(", ") : errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {Array.isArray(errors.email) ? errors.email.join(", ") : errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {Array.isArray(errors.phoneNumber) ? errors.phoneNumber.join(", ") : errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {Array.isArray(errors.password) ? errors.password.join(", ") : errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Button variant="link" className="px-0 h-auto" asChild>
                    <Link href="/terms" target="_blank">
                      Terms of Service
                    </Link>
                  </Button>{" "}
                  and{" "}
                  <Button variant="link" className="px-0 h-auto" asChild>
                    <Link href="/privacy" target="_blank">
                      Privacy Policy
                    </Link>
                  </Button>
                </Label>
              </div>

              <Button type="submit" className="w-full h-12" disabled={isSubmitting || isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" className="px-0" asChild>
                  <Link
                    href={`/login${redirectTo && redirectTo !== "/login" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                  >
                    Sign in
                  </Link>
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
