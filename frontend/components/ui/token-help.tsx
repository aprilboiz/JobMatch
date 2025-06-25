"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HelpCircle,
  Clock,
  RefreshCw,
  LogOut,
  Terminal,
  Info,
} from "lucide-react";
import { TokenManager } from "@/lib/utils/token-manager";

export function TokenHelp() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const showDebugInfo = () => {
    setDebugInfo(TokenManager.getDebugInfo());
  };

  const manualTokenUpdate = `
// Để cập nhật token thủ công qua console trình duyệt:

// 1. Mở Developer Tools (F12)
// 2. Vào tab Console
// 3. Chạy lệnh sau:

// Cập nhật access token
localStorage.setItem('access_token', 'YOUR_NEW_ACCESS_TOKEN_HERE');

// Cập nhật refresh token
localStorage.setItem('refresh_token', 'YOUR_NEW_REFRESH_TOKEN_HERE');

// Cập nhật thời gian hết hạn (giây)
localStorage.setItem('token_expires_in', '3600');

// Cập nhật timestamp hiện tại
localStorage.setItem('token_timestamp', Date.now().toString());

// Sau đó reload trang
window.location.reload();
`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Hướng dẫn xử lý token
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hướng dẫn xử lý JWT Token hết hạn
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Hệ thống tự động xử lý token hết hạn và làm mới token khi cần
              thiết. Dưới đây là thông tin chi tiết về cách thức hoạt động.
            </AlertDescription>
          </Alert>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="overview">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tổng quan về xử lý token
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Tự động làm mới
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Hệ thống tự động làm mới token khi còn 5 phút trước khi
                        hết hạn
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Tự động đăng xuất
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Khi token hết hạn và không thể làm mới, hệ thống tự động
                        đăng xuất
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="automatic">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Cơ chế tự động
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Kiểm tra định kỳ:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Kiểm tra trạng thái token mỗi 30 giây</li>
                      <li>• Hiển thị cảnh báo khi token sắp hết hạn</li>
                      <li>• Tự động làm mới khi còn 5 phút</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Xử lý API calls:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Tự động retry khi nhận 401 Unauthorized</li>
                      <li>• Làm mới token và thử lại request</li>
                      <li>• Chuyển đến login nếu refresh thất bại</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="manual">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Cập nhật token thủ công
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertDescription>
                      Chỉ sử dụng khi cần thiết cho mục đích debug hoặc testing
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      <code>{manualTokenUpdate}</code>
                    </pre>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="debug">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Thông tin debug
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Button onClick={showDebugInfo} variant="outline" size="sm">
                    Lấy thông tin token hiện tại
                  </Button>

                  {debugInfo && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        <code>{JSON.stringify(debugInfo, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="troubleshooting">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Xử lý sự cố
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          🔴 Token hết hạn liên tục
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">Giải pháp:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Kiểm tra đồng hồ hệ thống</li>
                          <li>• Xóa localStorage và đăng nhập lại</li>
                          <li>• Liên hệ admin nếu vấn đề tiếp tục</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          🟡 Refresh token thất bại
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">Giải pháp:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Đăng nhập lại</li>
                          <li>• Kiểm tra kết nối mạng</li>
                          <li>• Kiểm tra trạng thái server</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
