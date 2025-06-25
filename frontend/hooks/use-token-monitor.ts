import { useState, useEffect, useCallback } from "react";
import { TokenManager } from "@/lib/utils/token-manager";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";

interface TokenStatus {
  isValid: boolean;
  isNearExpiry: boolean;
  timeUntilExpiry: string;
  canRefresh: boolean;
}

export const useTokenMonitor = () => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    isValid: false,
    isNearExpiry: false,
    timeUntilExpiry: "",
    canRefresh: false,
  });

  const { toast } = useToast();
  const router = useRouter();

  const updateTokenStatus = useCallback(() => {
    const isValid = !TokenManager.isTokenExpired();
    const isNearExpiry = TokenManager.isTokenNearExpiry();
    const timeUntilExpiry = TokenManager.formatTimeUntilExpiry();
    const canRefresh = !!TokenManager.getRefreshToken();

    setTokenStatus({
      isValid,
      isNearExpiry,
      timeUntilExpiry,
      canRefresh,
    });

    return { isValid, isNearExpiry, canRefresh };
  }, []);

  const handleTokenExpired = useCallback(() => {
    toast({
      title: "Phiên đăng nhập hết hạn",
      description: "Đang chuyển hướng đến trang đăng nhập...",
      variant: "destructive",
      duration: 3000,
    });

    // Clear tokens và chuyển hướng
    TokenManager.clearTokens();

    setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
  }, [toast, router]);

  const handleNearExpiry = useCallback(() => {
    toast({
      title: "Phiên đăng nhập sắp hết hạn",
      description: `Thời gian còn lại: ${tokenStatus.timeUntilExpiry}`,
      variant: "default",
      duration: 5000,
    });
  }, [toast, tokenStatus.timeUntilExpiry]);

  useEffect(() => {
    // Initial check
    updateTokenStatus();

    // Set up monitoring
    const monitoringInterval = TokenManager.startTokenMonitoring(
      handleNearExpiry,
      handleTokenExpired,
      30000 // Check every 30 seconds
    );

    // Listen for token expiry events
    const handleTokenExpiredEvent = (event: CustomEvent) => {
      handleTokenExpired();
    };

    window.addEventListener(
      "tokenExpired",
      handleTokenExpiredEvent as EventListener
    );

    // Update status every minute
    const statusInterval = setInterval(updateTokenStatus, 60000);

    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
      clearInterval(statusInterval);
      window.removeEventListener(
        "tokenExpired",
        handleTokenExpiredEvent as EventListener
      );
    };
  }, [updateTokenStatus, handleNearExpiry, handleTokenExpired]);

  const refreshTokenManually = useCallback(async () => {
    try {
      // This would need to be implemented in your auth API
      // For now, just update the status
      updateTokenStatus();

      toast({
        title: "Làm mới phiên đăng nhập",
        description: "Phiên đăng nhập đã được làm mới thành công",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Lỗi làm mới phiên đăng nhập",
        description:
          "Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.",
        variant: "destructive",
      });
      handleTokenExpired();
    }
  }, [updateTokenStatus, toast, handleTokenExpired]);

  const getDebugInfo = useCallback(() => {
    return TokenManager.getDebugInfo();
  }, []);

  return {
    tokenStatus,
    refreshTokenManually,
    getDebugInfo,
    updateTokenStatus,
  };
};
