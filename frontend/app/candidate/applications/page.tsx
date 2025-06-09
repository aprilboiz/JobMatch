import CandidateLayout from "@/components/candidate-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, Calendar, Clock, Eye, FileText, MapPin, Star } from "lucide-react"

export default function CandidateApplications() {
  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Vietnam",
      location: "Hà Nội",
      appliedAt: "2024-01-15",
      status: "Đang xem xét",
      matchScore: 95,
      salary: "25-35 triệu",
      interviewDate: null,
      feedback: null,
    },
    {
      id: 2,
      jobTitle: "React Developer",
      company: "StartupXYZ",
      location: "TP.HCM",
      appliedAt: "2024-01-12",
      status: "Phỏng vấn",
      matchScore: 92,
      salary: "20-30 triệu",
      interviewDate: "2024-01-20 14:00",
      feedback: null,
    },
    {
      id: 3,
      jobTitle: "Full Stack Developer",
      company: "BigTech Solutions",
      location: "Đà Nẵng",
      appliedAt: "2024-01-10",
      status: "Chờ phản hồi",
      matchScore: 88,
      salary: "30-40 triệu",
      interviewDate: null,
      feedback: null,
    },
    {
      id: 4,
      jobTitle: "UI/UX Developer",
      company: "DesignHub",
      location: "Remote",
      appliedAt: "2024-01-08",
      status: "Từ chối",
      matchScore: 1,
      salary: "18-25 triệu",
      interviewDate: null,
      feedback: "Quá Gà",
    },
    {
      id: 5,
      jobTitle: "Frontend Developer",
      company: "WebCorp",
      location: "Hà Nội",
      appliedAt: "2024-01-05",
      status: "Đã nhận việc",
      matchScore: 90,
      salary: "22-28 triệu",
      interviewDate: "2024-01-12 10:00",
      feedback: "Ứng viên có kỹ năng tốt và phù hợp với vị trí",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang xxem xét":
        return "secondary"
      case "Phỏng vấn":
        return "default"
      case "Chờ phản hồi":
        return "outline"
      case "Từ chối":
        return "destructive"
      case "Đã nhận việc":
        return "default"
      default:
        return "secondary"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Đang xem xét":
        return "bg-yellow-50"
      case "Phỏng vấn":
        return "bg-blue-50"
      case "Chờ phản hồi":
        return "bg-gray-50"
      case "Từ chối":
        return "bg-red-50"
      case "Đã nhận việc":
        return "bg-green-50"
      default:
        return "bg-gray-50"
    }
  }

  const pendingApplications = applications.filter((app) =>
    ["Đang xem xét", "Phỏng vấn", "Chờ phản hồi"].includes(app.status),
  )
  const completedApplications = applications.filter((app) => ["Từ chối", "Đã nhận việc"].includes(app.status))

  const ApplicationCard = ({ application }: { application: (typeof applications)[0] }) => (
    <Card
      className={`${getStatusBgColor(application.status)} border-l-4 ${
        application.status === "Đã nhận việc"
          ? "border-l-green-500"
          : application.status === "Phỏng vấn"
            ? "border-l-blue-500"
            : application.status === "Từ chối"
              ? "border-l-red-500"
              : "border-l-yellow-500"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{application.jobTitle}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="h-4 w-4 mr-1" />
              <span className="font-medium">{application.company}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {application.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Ứng tuyển: {application.appliedAt}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-400" />
              <span className="text-sm font-medium">{application.matchScore}%</span>
            </div>
            <Badge variant={getStatusColor(application.status)}>{application.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600">Mức lương</div>
            <div className="font-semibold text-green-600">{application.salary}</div>
          </div>
          {application.interviewDate && (
            <div>
              <div className="text-sm text-gray-600">Lịch phỏng vấn</div>
              <div className="font-medium text-blue-600">{application.interviewDate}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600">Trạng thái</div>
            <div className="font-medium">{application.status}</div>
          </div>
        </div>

        {application.feedback && (
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Phản hồi từ nhà tuyển dụng:</div>
            <div className="text-sm text-gray-800">{application.feedback}</div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Xem JD
          </Button>
          {application.status === "Phỏng vấn" && (
            <Button size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Xác nhận phỏng vấn
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <CandidateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử ứng tuyển</h1>
          <p className="text-gray-600">Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
              <div className="text-sm text-gray-600">Tổng ứng tuyển</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
              <div className="text-sm text-gray-600">Đang chờ</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter((app) => app.status === "Phỏng vấn").length}
              </div>
              <div className="text-sm text-gray-600">Phỏng vấn</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter((app) => app.status === "Đã nhận việc").length}
              </div>
              <div className="text-sm text-gray-600">Thành công</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Đang chờ ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <FileText className="mr-2 h-4 w-4" />
              Đã hoàn thành ({completedApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApplications.length > 0 ? (
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn ứng tuyển đang chờ</h3>
                  <p className="text-gray-600">Các đơn ứng tuyển đang chờ xử lý sẽ hiển thị ở đây</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedApplications.length > 0 ? (
              <div className="space-y-4">
                {completedApplications.map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn ứng tuyển nào hoàn thành</h3>
                  <p className="text-gray-600">Các đơn ứng tuyển đã hoàn thành sẽ hiển thị ở đây</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CandidateLayout>
  )
}
