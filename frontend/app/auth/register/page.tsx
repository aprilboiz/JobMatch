"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "", // Changed from phone to phoneNumber
    password: "",
    confirmPassword: "",
    role: (searchParams.get("role")?.toUpperCase() as "CANDIDATE" | "RECRUITER") || ("" as "CANDIDATE" | "RECRUITER"),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      })
      return
    }

    if (!formData.role) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn vai trò",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber, // Changed from phone to phoneNumber
        password: formData.password,
        role: formData.role,
      })

      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.",
      })

      // Redirect to login page
      router.push("/auth/login")
    } catch (error) {
      toast({
        title: "Đăng ký thất bại",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại.",
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

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "CANDIDATE" | "RECRUITER",
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">JobMatch</span>
          </div>
          <CardTitle className="text-2xl">Đăng ký</CardTitle>
          <CardDescription>Tạo tài khoản mới để bắt đầu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

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
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber" // Changed from phone to phoneNumber
                type="tel"
                placeholder="0123456789"
                value={formData.phoneNumber}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select value={formData.role} onValueChange={handleRoleChange} required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò của bạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CANDIDATE">Ứng viên</SelectItem>
                  <SelectItem value="RECRUITER">Nhà tuyển dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
