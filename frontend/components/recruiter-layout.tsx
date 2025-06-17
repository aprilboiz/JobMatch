'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '../lib/services/auth';

interface RecruiterLayoutProps {
  children: React.ReactNode;
}

const RecruiterLayout: React.FC<RecruiterLayoutProps> = ({ children }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const success = await authUtils.logout();
      if (success) {
        router.push('/auth/login');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Logout failed:', error.message);
      } else {
        console.error('Unknown logout error:', String(error));
      }
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">JobMatch</h1>
            <span className="ml-2 text-sm text-gray-500">Recruiter</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a href="/recruiter/dashboard" className="flex items-center px-4 py-2 text-gray-700 bg-blue-50 rounded-lg">
              Dashboard
            </a>
            {/* <a href="/recruiter/jobs" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Tin tuyển dụng
            </a> */}
            <a href="/recruiter/candidates" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Ứng viên
            </a>
            <a href="/recruiter/company" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Thông tin công ty
            </a>
            {/* <a href="/recruiter/analytics" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Thống kê
            </a> */}
          </nav>

          {/* User info và Logout button */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">R</span>
                </div>
                <span className="text-sm text-gray-600">Nhà tuyển dụng</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
