"use client"

import { useState, useEffect } from "react"
import CandidateLayout from "@/components/candidate-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, Calendar, Clock, Eye, FileText, MapPin, Star } from "lucide-react"
import { applicationsApi } from "@/lib/api/applications"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import type { ApplicationResponse } from "@/types/api"

export default function CandidateApplications() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Loading applications...")
      const response = await applicationsApi.getCandidateApplications()
      console.log("Applications response received:", response)
      
      // Extract data from paginated response
      const data = response.data || []
      console.log("Applications data:", data)
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setApplications(data)
      } else {
        console.warn("Applications data is not an array:", data)
        setApplications([])
      }
    } catch (error) {
      console.error("Failed to load applications:", error)
      setError("Không thể tải danh sách ứng tuyển")
      setApplications([]) // Ensure applications is always an array
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: ApplicationResponse["status"]) => {
    switch (status) {
      case "PENDING":
        return "secondary"
      case "REVIEWING":
        return "default"
      case "INTERVIEW":
        return "default"
      case "REJECTED":
        return "destructive"
      case "ACCEPTED":
        return "default"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: ApplicationResponse["status"]) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý"
      case "REVIEWING":
        return "Đang xem xét"
      case "INTERVIEW":
        return "Phỏng vấn"
      case "REJECTED":
        return "Từ chối"
      case "ACCEPTED":
        return "Đã nhận"
      default:
        return status
    }
  }

  const getStatusBgColor = (status: ApplicationResponse["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50"
      case "REVIEWING":
        return "bg-blue-50"
      case "INTERVIEW":
        return "bg-green-50"
      case "REJECTED":
        return "bg-red-50"
      case "ACCEPTED":
        return "bg-green-50"
      default:
        return "bg-gray-50"
    }
  }

  const pendingApplications = Array.isArray(applications) 
    ? applications.filter((app) => ["PENDING", "REVIEWING", "INTERVIEW"].includes(app.status))
    : []
  const completedApplications = Array.isArray(applications)
    ? applications.filter((app) => ["REJECTED", "ACCEPTED"].includes(app.status))
    : []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const ApplicationCard = ({ application }: { application: ApplicationResponse }) => (
    <Card
      className={`${getStatusBgColor(application.status)} border-l-4 ${
        application.status === "ACCEPTED"
          ? "border-l-green-500"
          : application.status === "INTERVIEW"
            ? "border-l-blue-500"
            : application.status === "REJECTED"
              ? "border-l-red-500"
              : "border-l-yellow-500"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{application.job.title}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="h-4 w-4 mr-1" />
              <span className="font-medium">{application.job.company}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {application.job.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Ứng tuyển: {formatDate(application.appliedAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {application.matchScore && (
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                <span className="text-sm font-medium">{application.matchScore}%</span>
              </div>
            )}
            <Badge variant={getStatusColor(application.status)}>{getStatusText(application.status)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600">Mức lương</div>
            <div className="font-semibold text-green-600">{application.job.salary}</div>
          </div>
          {application.interviewDate && (
            <div>
              <div className="text-sm text-gray-600">Lịch phỏng vấn</div>
              <div className="font-medium text-blue-600">{formatDate(application.interviewDate)}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600">Trạng thái</div>
            <div className="font-medium">{getStatusText(application.status)}</div>
          </div>
        </div>

        {application.notes && (
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Ghi chú từ nhà tuyển dụng:</div>
            <div className="text-sm text-gray-800">{application.notes}</div>
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
          {application.status === "INTERVIEW" && (
            <Button size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Xác nhận phỏng vấn
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <CandidateLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </CandidateLayout>
    )
  }

  if (error) {
    return (
      <CandidateLayout>
        <ErrorMessage message={error} onRetry={loadApplications} />
      </CandidateLayout>
    )
  }

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
                {applications.filter((app) => app.status === "INTERVIEW").length}
              </div>
              <div className="text-sm text-gray-600">Phỏng vấn</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter((app) => app.status === "ACCEPTED").length}
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
