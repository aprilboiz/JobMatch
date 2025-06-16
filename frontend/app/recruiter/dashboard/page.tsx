import RecruiterLayout from "@/components/recruiter-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, FileText, TrendingUp, Clock, Briefcase } from "lucide-react"
import React from 'react';

export default function RecruiterDashboard() {
  const stats = [
    { name: "Tin tuyển dụng đã đăng", value: "8", icon: FileText, color: "text-blue-600" },
    { name: "Ứng viên tiềm năng", value: "156", icon: Users, color: "text-green-600" },
    { name: "Lượt xem tin tuyển dụng", value: "2.4k", icon: TrendingUp, color: "text-purple-600" },
    { name: "Hồ sơ chờ xem xét", value: "23", icon: Clock, color: "text-orange-600" },
  ]

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại! Đây là tổng quan về hoạt động tuyển dụng của bạn.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Hoàn thiện thông tin công ty</CardTitle>
              <CardDescription>Thông tin công ty đầy đủ sẽ thu hút nhiều ứng viên chất lượng hơn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiến độ hoàn thiện</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Còn thiếu:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Thêm logo công ty</li>
                  <li>• Cập nhật địa chỉ chi tiết</li>
                  <li>• Thêm mô tả văn hóa công ty</li>
                </ul>
              </div>
              <Button className="w-full">Hoàn thiện thông tin</Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động nhanh</CardTitle>
              <CardDescription>Các tính năng thường dùng cho nhà tuyển dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Đăng tin tuyển dụng mới
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Tìm kiếm ứng viên
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Xem báo cáo thống kê
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Quản lý thông tin công ty
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle>Chào mừng đến với JobMatch</CardTitle>
            <CardDescription>Tìm kiếm và tuyển dụng nhân tài cho công ty của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sẵn sàng tìm kiếm nhân tài?
              </h3>
              <p className="text-gray-600 mb-6">
                Khám phá hàng nghìn ứng viên chất lượng và đăng tin tuyển dụng để tiếp cận ứng viên phù hợp.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  Đăng tin tuyển dụng
                </Button>
                <Button variant="outline" size="lg">
                  Tìm kiếm ứng viên
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  )
}
