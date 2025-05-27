import RecruiterLayout from "@/components/recruiter-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, TrendingUp, Clock, Plus, Eye, Star, MapPin, Calendar } from "lucide-react"

export default function RecruiterDashboard() {
  const stats = [
    { name: "Việc làm đang tuyển", value: "8", icon: Briefcase, color: "text-blue-600" },
    { name: "Ứng viên mới", value: "24", icon: Users, color: "text-green-600" },
    { name: "Lượt xem JD", value: "1,234", icon: TrendingUp, color: "text-purple-600" },
    { name: "Phỏng vấn hôm nay", value: "5", icon: Clock, color: "text-orange-600" },
  ]

  const recentJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Hà Nội",
      applicants: 45,
      status: "Đang tuyển",
      postedAt: "3 ngày trước",
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "TP.HCM",
      applicants: 28,
      status: "Đang tuyển",
      postedAt: "1 tuần trước",
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      applicants: 67,
      status: "Tạm dừng",
      postedAt: "2 tuần trước",
    },
  ]

  const topCandidates = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      position: "Frontend Developer",
      matchScore: 95,
      experience: "3 năm",
      appliedAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Trần Thị B",
      position: "Product Manager",
      matchScore: 92,
      experience: "5 năm",
      appliedAt: "2024-01-14",
    },
    {
      id: 3,
      name: "Lê Văn C",
      position: "UX Designer",
      matchScore: 88,
      experience: "4 năm",
      appliedAt: "2024-01-13",
    },
  ]

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Tổng quan hoạt động tuyển dụng của công ty</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo JD mới
          </Button>
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
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Việc làm gần đây</CardTitle>
              <CardDescription>Quản lý các vị trí tuyển dụng đang mở</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{job.department}</span>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {job.applicants} ứng viên
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{job.postedAt}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={job.status === "Đang tuyển" ? "default" : "secondary"}>{job.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Xem tất cả việc làm
              </Button>
            </CardContent>
          </Card>

          {/* Top Candidates */}
          <Card>
            <CardHeader>
              <CardTitle>Ứng viên nổi bật</CardTitle>
              <CardDescription>Ứng viên có điểm phù hợp cao nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCandidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.position}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{candidate.experience}</span>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {candidate.appliedAt}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{candidate.matchScore}%</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Xem tất cả ứng viên
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
            <CardDescription>Các tác vụ thường dùng trong quá trình tuyển dụng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Tạo JD mới
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Xem ứng viên
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                Báo cáo
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                Lịch phỏng vấn
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  )
}
