"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Building2,
  Menu,
  Home,
  User,
  Briefcase,
  FileText,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  // { name: "Dashboard", href: "/candidate/dashboard", icon: Home },
  { name: "Việc làm", href: "/candidate/jobs", icon: Briefcase },
  { name: "Hồ sơ", href: "/candidate/profile", icon: User },
  { name: "Ứng tuyển", href: "/candidate/applications", icon: FileText },
];
function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logout();
      console.log("Đăng xuất thành công");
      // Always redirect even if logout API fails
      window.location.href = "http://localhost:6789";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      // Still redirect on error since user wants to logout
      window.location.href = "http://localhost:6789";
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleLogout}
    >
      <LogOut className="mr-3 h-5 w-5" />
      Đăng xuất
    </Button>
  );
}
export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4 mb-8">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                JobMatch
              </span>
            </div>

            {/* User info section */}
            <div className="px-4 mb-6">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "UV"}
                  </span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || "Ứng viên"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">Ứng viên</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-900 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                    {item.name === "Việc làm" && (
                      <Search className="ml-auto h-4 w-4 text-gray-400" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed top-4 left-4 z-40"
            size="sm"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex min-h-0 flex-1 flex-col bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4 mb-8">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  JobMatch
                </span>
              </div>

              {/* User info section for mobile */}
              <div className="px-4 mb-6">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.fullName
                        ? user.fullName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "UV"}
                    </span>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.fullName || "Ứng viên"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">Ứng viên</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-blue-100 text-blue-900 border-r-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          isActive
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-500"
                        )}
                      />
                      {item.name}
                      {item.name === "Việc làm" && (
                        <Search className="ml-auto h-4 w-4 text-gray-400" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <LogoutButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">{/* Mobile menu button space */}</div>

            {/* Page title */}
            <div className="flex items-center space-x-2">
              {navigation.map((item) => {
                if (pathname === item.href) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center space-x-2"
                    >
                      <item.icon className="h-5 w-5 text-gray-600" />
                      <h1 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h1>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="flex items-center space-x-4 ml-auto">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "UV"}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.fullName || "Ứng viên"}
                  </span>
                  <p className="text-xs text-gray-500">
                    {user?.email || "candidate"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
