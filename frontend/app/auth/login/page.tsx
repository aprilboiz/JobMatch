"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { userApi } from "@/lib/api/user"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "1@gmail.com", // Pre-filled for testing
    password: "123456", // Pre-filled for testing
  })

  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("Login attempt with:", { email: formData.email, password: "***" }) // Debug log

    try {
      const response = await login(formData.email, formData.password)
      console.log("Login successful:", response) // Debug log

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      })

      // Use user data from response (which now includes user info)
      const userRole = await (await userApi.getCurrentUser()).role.roleName
      console.log("Login successful, user role:", userRole)

      if (userRole.toUpperCase() === "CANDIDATE") {
        router.push("/candidate/dashboard")
      } else if (userRole.toUpperCase() === "RECRUITER") {
        router.push("/recruiter/dashboard")
      } else {
        // Fallback - redirect to home and let the app figure out the role
        console.warn("Unknown user role, redirecting to home:", userRole)
        router.push("/")
      }
    } catch (error) {
      console.error("Login error:", error)

      let errorMessage = "Vui lòng kiểm tra lại thông tin đăng nhập"
      if (error instanceof Error) {
        if (error.message.includes("Authentication failed")) {
          errorMessage = "Email hoặc mật khẩu không đúng"
        } else if (error.message.includes("Network")) {
          errorMessage = "Không thể kết nối đến server. Vui lòng thử lại."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Test function to check basic API connectivity (without auth)
  const testConnection = async () => {
    try {
      console.log("Testing basic API connection...")
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

      // Try a simple request to see if server is running
      const response = await fetch(baseUrl.replace("/api", ""), {
        method: "GET",
        mode: "cors",
      })

      console.log("Basic connection test:", response.status)

      if (response.status === 404) {
        // 404 is actually good - means server is running
        toast({
          title: "Server đang chạy",
          description: "Backend server có thể kết nối được",
        })
      } else {
        toast({
          title: `Server Response: ${response.status}`,
          description: "Kiểm tra console để xem chi tiết",
        })
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      toast({
        title: "Không thể kết nối",
        description: "Backend server có thể chưa chạy hoặc sai URL",
        variant: "destructive",
      })
    }
  }

  // Test with sample credentials
  const testWithSampleCredentials = () => {
    setFormData({
      email: "admin@test.com",
      password: "admin123",
    })
    toast({
      title: "Đã điền thông tin test",
      description: "Thử đăng nhập với admin@test.com / admin123",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">JobMatch</span>
          </div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin để truy cập tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            {/* Debug buttons - remove in production */}
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={testConnection}>
                Test Server
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={testWithSampleCredentials}>
                Sample Login
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <div>API URL: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}</div>
            <div>
              Current: {formData.email} / {formData.password}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
