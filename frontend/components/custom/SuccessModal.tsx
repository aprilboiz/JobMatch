// app/components/custom/SuccessModal.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <DialogTitle className="text-2xl font-bold">
              Đăng ký thành công!
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {/* Bạn vui lòng truy cập email để kích hoạt tài khoản. */}
            </p>
          </div>
        </DialogHeader>
        <Button onClick={onClose} className="w-full">
          Đã hiểu
        </Button>
      </DialogContent>
    </Dialog>
  );
}
