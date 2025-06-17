'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '../lib/services/auth';

interface CandidateLayoutProps {
  children: React.ReactNode;
}

const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const success = await authUtils.logout();
      if (success) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
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
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a href="/candidate/dashboard" className="flex items-center px-4 py-2 text-gray-700 bg-blue-50 rounded-lg">
              Dashboard
            </a>
            <a href="/candidate/profile" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Hồ sơ
            </a>
            <a href="/candidate/jobs" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Việc làm
            </a>
            <a href="/candidate/applications" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Ứng tuyển
            </a>
          </nav>

          {/* User info và Logout button */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <span className="text-sm text-gray-600">Ứng viên</span>
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

export default CandidateLayout;
