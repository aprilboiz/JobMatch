import CandidateLayout from "@/components/candidate-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Briefcase, FileText, TrendingUp, Clock, User } from "lucide-react"
import React from 'react';
import CvManager from '../../../components/candidate/CvManager';
import ApplicationsList from '../../../components/candidate/ApplicationsList';

export default function CandidateDashboard() {
  const stats = [
    { name: "Việc làm đã ứng tuyển", value: "12", icon: FileText, color: "text-blue-600" },
    { name: "Việc làm phù hợp", value: "24", icon: Briefcase, color: "text-green-600" },
    { name: "Lượt xem hồ sơ", value: "156", icon: TrendingUp, color: "text-purple-600" },
    { name: "Phản hồi chờ xử lý", value: "3", icon: Clock, color: "text-orange-600" },
  ]

  return (
    <CandidateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại! Đây là tổng quan về hoạt động của bạn.</p>
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
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Hoàn thiện hồ sơ</CardTitle>
              <CardDescription>Hồ sơ hoàn thiện sẽ giúp bạn có cơ hội được tuyển dụng cao hơn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiến độ hoàn thiện</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Còn thiếu:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Upload CV</li>
                  <li>• Thêm kỹ năng</li>
                  <li>• Cập nhật kinh nghiệm</li>
                </ul>
              </div>
              <Button className="w-full">Hoàn thiện hồ sơ</Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động nhanh</CardTitle>
              <CardDescription>Các tính năng thường dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Tìm việc làm mới
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Cập nhật hồ sơ
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Xem thống kê
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="h-4 w-4 mr-2" />
                Quản lý ứng tuyển
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CV Manager */}
        <CvManager />

        {/* Applications List */}
        <ApplicationsList />
      </div>
    </CandidateLayout>
  )
}
