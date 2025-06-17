"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { login } from '@/lib/services/auth';

import { getCurrentUser, login } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Eye, EyeOff, XCircle } from "lucide-react";

// --- BƯỚC 1: TẠO COMPONENT THÔNG BÁO LỖI ---a
interface NotificationProps {
  message: string;
  onClose: () => void;
}

function ErrorNotification({ message, onClose }: NotificationProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-xl">
        <div className="flex justify-center mb-4">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Đăng nhập không thành công
        </h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <Button onClick={onClose} className="w-full">
          Đã hiểu
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [notificationMessage, setNotificationMessage] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotificationMessage("");

    try {
      const result = await login(email, password);

      if (result.success) {
        // Đảm bảo cookies được set
        const { authUtils } = await import("@/lib/services/auth");
        authUtils.setTokens(result.data.token, result.data.refreshToken);

        // Thêm delay để cookies được set hoàn toàn
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { role } = await getCurrentUser();
        const userRole = role?.roleName.toLowerCase();
        // viết cconsole.log để kiểm tra userRole
        console.log("User role:", userRole);

        // Force reload thay vì redirect
        if (userRole === "recruiter") {
          // chuyển hướng tới đường dẫn /recruiter/dashboard như dùng href
          router.push("/recruiter/dashboard");
        } else if (userRole === "candidate") {
          // chuyển hướng tới đường dẫn /candidate/dashboard như dùng href
          router.push("/candidate/dashboard");
        }
      }
    } catch (err: any) {
      setNotificationMessage(err.message || "Đăng nhập thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Thêm position-relative để overlay hoạt động tốt
    <div className="relative">
      {/* --- BƯỚC 4: RENDER COMPONENT THÔNG BÁO --- */}
      <ErrorNotification
        message={notificationMessage}
        onClose={() => setNotificationMessage("")}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                JobMatch
              </span>
            </div>
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin để truy cập tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
