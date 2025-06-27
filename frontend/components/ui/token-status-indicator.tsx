"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { useTokenMonitor } from "@/hooks/use-token-monitor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function TokenStatusIndicator() {
  const { tokenStatus, refreshTokenManually, getDebugInfo } = useTokenMonitor();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTokenManually();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (!tokenStatus.isValid) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (tokenStatus.isNearExpiry) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = () => {
    if (!tokenStatus.isValid) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    }
    if (tokenStatus.isNearExpiry) {
      return <Badge variant="secondary">Sắp hết hạn</Badge>;
    }
    return <Badge variant="default">Hợp lệ</Badge>;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* <Button variant="ghost" size="sm" className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">Phiên đăng nhập</span>
        </Button> */}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Trạng thái phiên đăng nhập
              {getStatusBadge()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Thời gian còn lại:</span>
                <span className="font-medium">
                  {tokenStatus.timeUntilExpiry}
                </span>
              </div>

              {tokenStatus.isNearExpiry && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                  ⚠️ Phiên đăng nhập sắp hết hạn
                </div>
              )}

              {!tokenStatus.isValid && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
                  ❌ Phiên đăng nhập đã hết hạn
                </div>
              )}
            </div>

            {tokenStatus.canRefresh && (
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="sm"
                className="w-full"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                {isRefreshing ? "Đang làm mới..." : "Làm mới phiên đăng nhập"}
              </Button>
            )}

            <Button
              onClick={() => setShowDebug(!showDebug)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Info className="h-4 w-4 mr-2" />
              {showDebug ? "Ẩn" : "Hiện"} thông tin debug
            </Button>

            {showDebug && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono">
                <pre>{JSON.stringify(getDebugInfo(), null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
