"use client"

import { useState } from "react"
import RecruiterLayout from "@/components/recruiter-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Pause, Play, Users, Calendar, MapPin, Building, Briefcase } from "lucide-react"

export default function RecruiterJobs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Hà Nội",
      type: "Full-time",
      salary: "25-35 triệu",
      experience: "3-5 năm",
      status: "Đang tuyển",
      applicants: 45,
      views: 234,
      postedAt: "2024-01-10",
      deadline: "2024-02-10",
      description:
        "Tìm kiếm Senior Frontend Developer có kinh nghiệm với React, TypeScript để tham gia phát triển sản phẩm core của công ty.",
      requirements: [
        "3+ năm kinh nghiệm với React, TypeScript",
        "Kinh nghiệm với state management (Redux, Zustand)",
        "Hiểu biết về performance optimization",
        "Kỹ năng giao tiếp tốt",
      ],
      skills: ["React", "TypeScript", "Redux", "CSS", "Git"],
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "TP.HCM",
      type: "Full-time",
      salary: "30-45 triệu",
      experience: "4-6 năm",
      status: "Đang tuyển",
      applicants: 28,
      views: 156,
      postedAt: "2024-01-08",
      deadline: "2024-02-08",
      description:
        "Cần Product Manager có kinh nghiệm để dẫn dắt phát triển sản phẩm và làm việc với các team cross-functional.",
      requirements: [
        "4+ năm kinh nghiệm Product Management",
        "Kinh nghiệm với Agile/Scrum",
        "Kỹ năng phân tích và data-driven",
        "Leadership skills",
      ],
      skills: ["Product Management", "Agile", "Analytics", "Leadership"],
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      type: "Remote",
      salary: "20-30 triệu",
      experience: "2-4 năm",
      status: "Tạm dừng",
      applicants: 67,
      views: 445,
      postedAt: "2024-01-05",
      deadline: "2024-02-05",
      description: "Tuyển UX Designer để thiết kế trải nghiệm người dùng cho các sản phẩm digital của công ty.",
      requirements: [
        "2+ năm kinh nghiệm UX Design",
        "Thành thạo Figma, Sketch",
        "Hiểu biết về user research",
        "Portfolio mạnh",
      ],
      skills: ["UX Design", "Figma", "User Research", "Prototyping"],
    },
    {
      id: 4,
      title: "Backend Developer",
      department: "Engineering",
      location: "Đà Nẵng",
      type: "Full-time",
      salary: "22-32 triệu",
      experience: "2-4 năm",
      status: "Đang tuyển",
      applicants: 33,
      views: 189,
      postedAt: "2024-01-12",
      deadline: "2024-02-12",
      description: "Cần Backend Developer có kinh nghiệm với Node.js, Python để phát triển API và hệ thống backend.",
      requirements: [
        "2+ năm kinh nghiệm Backend development",
        "Thành thạo Node.js hoặc Python",
        "Kinh nghiệm với database (MongoDB, PostgreSQL)",
        "Hiểu biết về microservices",
      ],
      skills: ["Node.js", "Python", "MongoDB", "PostgreSQL", "Docker"],
    },
  ]

  const activeJobs = jobs.filter((job) => job.status === "Đang tuyển")
  const pausedJobs = jobs.filter((job) => job.status === "Tạm dừng")
  const draftJobs: typeof jobs = [] // Empty for demo

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang tuyển":
        return "default"
      case "Tạm dừng":
        return "secondary"
      case "Đã đóng":
        return "destructive"
      default:
        return "outline"
    }
  }

  const JobCard = ({ job }: { job: (typeof jobs)[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {job.department}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Đăng: {job.postedAt}
              </div>
            </div>
            <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
          </div>
          <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 4}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-600">Ứng viên</div>
            <div className="font-semibold text-blue-600">{job.applicants}</div>
          </div>
          <div>
            <div className="text-gray-600">Lượt xem</div>
            <div className="font-semibold">{job.views}</div>
          </div>
          <div>
            <div className="text-gray-600">Mức lương</div>
            <div className="font-semibold text-green-600">{job.salary}</div>
          </div>
          <div>
            <div className="text-gray-600">Kinh nghiệm</div>
            <div className="font-semibold">{job.experience}</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </Button>
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Ứng viên ({job.applicants})
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="outline" size="sm">
            {job.status === "Đang tuyển" ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Tạm dừng
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Kích hoạt
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý việc làm</h1>
            <p className="text-gray-600">Tạo và quản lý các vị trí tuyển dụng</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo JD mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo Job Description mới</DialogTitle>
                <DialogDescription>Điền thông tin chi tiết về vị trí tuyển dụng</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Tên vị trí</Label>
                    <Input id="jobTitle" placeholder="VD: Senior Frontend Developer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Phòng ban</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Địa điểm</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn địa điểm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hanoi">Hà Nội</SelectItem>
                        <SelectItem value="hcm">TP.HCM</SelectItem>
                        <SelectItem value="danang">Đà Nẵng</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Loại hình</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại hình" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">Full-time</SelectItem>
                        <SelectItem value="parttime">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Mức lương</Label>
                    <Input id="salary" placeholder="VD: 20-30 triệu" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Kinh nghiệm</Label>
                    <Input id="experience" placeholder="VD: 2-4 năm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả công việc</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Mô tả chi tiết về vị trí và trách nhiệm công việc..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Yêu cầu công việc</Label>
                  <Textarea id="requirements" rows={4} placeholder="Liệt kê các yêu cầu về kỹ năng, kinh nghiệm..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Kỹ năng cần có</Label>
                  <Input id="skills" placeholder="VD: React, TypeScript, Node.js (cách nhau bằng dấu phẩy)" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Hạn ứng tuyển</Label>
                  <Input id="deadline" type="date" />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>Tạo JD</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên vị trí, phòng ban..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
              <div className="text-sm text-gray-600">Tổng JD</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{activeJobs.length}</div>
              <div className="text-sm text-gray-600">Đang tuyển</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pausedJobs.length}</div>
              <div className="text-sm text-gray-600">Tạm dừng</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {jobs.reduce((sum, job) => sum + job.applicants, 0)}
              </div>
              <div className="text-sm text-gray-600">Tổng ứng viên</div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              <Briefcase className="mr-2 h-4 w-4" />
              Đang tuyển ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              <Pause className="mr-2 h-4 w-4" />
              Tạm dừng ({pausedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              <Edit className="mr-2 h-4 w-4" />
              Bản nháp ({draftJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeJobs.length > 0 ? (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có JD nào đang tuyển</h3>
                  <p className="text-gray-600">Tạo JD mới để bắt đầu tuyển dụng</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            {pausedJobs.length > 0 ? (
              <div className="space-y-4">
                {pausedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Pause className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không có JD nào tạm dừng</h3>
                  <p className="text-gray-600">Các JD tạm dừng sẽ hiển thị ở đây</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bản nháp nào</h3>
                <p className="text-gray-600">Các JD đang soạn thảo sẽ hiển thị ở đây</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  )
}
