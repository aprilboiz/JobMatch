import CandidateLayout from "@/components/candidate-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Briefcase, FileText, TrendingUp, Clock, MapPin, Building, Star } from "lucide-react"

export default function CandidateDashboard() {
  const stats = [
    { name: "Việc làm đã ứng tuyển", value: "12", icon: FileText, color: "text-blue-600" },
    { name: "Việc làm phù hợp", value: "24", icon: Briefcase, color: "text-green-600" },
    { name: "Lượt xem hồ sơ", value: "156", icon: TrendingUp, color: "text-purple-600" },
    { name: "Phản hồi chờ xử lý", value: "3", icon: Clock, color: "text-orange-600" },
  ]

  const recentJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Hà Nội",
      salary: "15-25 triệu",
      matchScore: 92,
      postedAt: "2 ngày trước",
    },
    {
      id: 2,
      title: "React Developer",
      company: "StartupXYZ",
      location: "TP.HCM",
      salary: "20-30 triệu",
      matchScore: 88,
      postedAt: "1 tuần trước",
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "BigTech",
      location: "Đà Nẵng",
      salary: "25-35 triệu",
      matchScore: 85,
      postedAt: "3 ngày trước",
    },
  ]

  const recentApplications = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechViet",
      appliedAt: "2024-01-15",
      status: "Đang xem xét",
    },
    {
      id: 2,
      title: "React Native Developer",
      company: "MobileFirst",
      appliedAt: "2024-01-12",
      status: "Phỏng vấn",
    },
    {
      id: 3,
      title: "UI/UX Developer",
      company: "DesignHub",
      appliedAt: "2024-01-10",
      status: "Từ chối",
    },
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

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Ứng tuyển gần đây</CardTitle>
              <CardDescription>Theo dõi trạng thái các đơn ứng tuyển của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{application.title}</h4>
                      <p className="text-sm text-gray-600">{application.company}</p>
                      <p className="text-xs text-gray-500">{application.appliedAt}</p>
                    </div>
                    <Badge
                      variant={
                        application.status === "Phỏng vấn"
                          ? "default"
                          : application.status === "Từ chối"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Xem tất cả ứng tuyển
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Việc làm phù hợp</CardTitle>
            <CardDescription>Các công việc được AI gợi ý dựa trên hồ sơ của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{job.matchScore}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="font-medium text-green-600">{job.salary}</div>
                    <div className="text-xs text-gray-500">{job.postedAt}</div>
                  </div>

                  <Button className="w-full mt-3" size="sm">
                    Ứng tuyển ngay
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Xem thêm việc làm
            </Button>
          </CardContent>
        </Card>
      </div>
    </CandidateLayout>
  )
}
