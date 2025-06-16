// components/LogoutButton.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '../lib/services/auth';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = "logout-btn", 
  children = "Đăng xuất" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const success = await authUtils.logout();
      
      if (success) {
        // Chuyển hướng về trang login
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Vẫn chuyển hướng dù có lỗi
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Đang đăng xuất...' : children}
    </button>
  );
};

export default LogoutButton;
