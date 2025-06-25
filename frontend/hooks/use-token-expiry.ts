import { useEffect } from "react";
import { useToast } from "./use-toast";

export const useTokenExpiry = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleTokenExpired = (event: CustomEvent) => {
      const { message, redirectDelay } = event.detail;

      toast({
        title: "Phiên đăng nhập hết hạn",
        description: message,
        variant: "destructive",
        duration: redirectDelay || 3000,
      });
    };

    // Listen for token expiry events
    window.addEventListener(
      "tokenExpired",
      handleTokenExpired as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "tokenExpired",
        handleTokenExpired as EventListener
      );
    };
  }, [toast]);
};
