"use client"

import { useState } from "react"
import CandidateLayout from "@/components/candidate-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Plus, X, Edit, Save, User, Briefcase, GraduationCap, Award } from "lucide-react"

export default function CandidateProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [skills, setSkills] = useState(["React", "JavaScript", "TypeScript", "Node.js", "Python"])
  const [newSkill, setNewSkill] = useState("")

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  return (
    <CandidateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <p className="text-gray-600">Quản lý thông tin cá nhân và CV của bạn</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "default" : "outline"}>
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">
              <User className="mr-2 h-4 w-4" />
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger value="experience">
              <Briefcase className="mr-2 h-4 w-4" />
              Kinh nghiệm
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="mr-2 h-4 w-4" />
              Học vấn
            </TabsTrigger>
            <TabsTrigger value="cv">
              <FileText className="mr-2 h-4 w-4" />
              CV
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input id="fullName" defaultValue="Nguyễn Văn A" disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="nguyenvana@email.com" disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" defaultValue="0123456789" disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Địa chỉ</Label>
                    <Input id="location" defaultValue="Hà Nội, Việt Nam" disabled={!isEditing} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Giới thiệu bản thân</Label>
                  <Textarea
                    id="summary"
                    rows={4}
                    defaultValue="Frontend Developer với 3 năm kinh nghiệm phát triển ứng dụng web sử dụng React, TypeScript và Node.js. Có kinh nghiệm làm việc trong môi trường Agile và đam mê tạo ra những sản phẩm có trải nghiệm người dùng tốt."
                    disabled={!isEditing}
                  />
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <Label>Kỹ năng</Label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                        {isEditing && (
                          <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Thêm kỹ năng mới"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button onClick={addSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle>Kinh nghiệm làm việc</CardTitle>
                <CardDescription>Thêm và quản lý kinh nghiệm làm việc của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Frontend Developer</h3>
                        <p className="text-blue-600 font-medium">TechCorp Vietnam</p>
                        <p className="text-sm text-gray-600">01/2022 - Hiện tại</p>
                        <p className="text-sm text-gray-700 mt-2">
                          Phát triển và duy trì các ứng dụng web sử dụng React, TypeScript. Tham gia xây dựng hệ thống
                          quản lý nội bộ phục vụ 1000+ người dùng.
                        </p>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Junior Frontend Developer</h3>
                        <p className="text-blue-600 font-medium">StartupXYZ</p>
                        <p className="text-sm text-gray-600">06/2021 - 12/2021</p>
                        <p className="text-sm text-gray-700 mt-2">
                          Học hỏi và phát triển kỹ năng frontend, tham gia dự án xây dựng website thương mại điện tử sử
                          dụng React và Redux.
                        </p>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm kinh nghiệm
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Học vấn</CardTitle>
                <CardDescription>Thông tin về trình độ học vấn và chứng chỉ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Cử nhân Công nghệ Thông tin</h3>
                        <p className="text-blue-600 font-medium">Đại học Bách Khoa Hà Nội</p>
                        <p className="text-sm text-gray-600">2017 - 2021</p>
                        <p className="text-sm text-gray-700 mt-2">GPA: 3.2/4.0 - Chuyên ngành Kỹ thuật Phần mềm</p>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    Chứng chỉ
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium">React Developer Certificate</h5>
                      <p className="text-sm text-gray-600">Meta - 2022</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium">AWS Cloud Practitioner</h5>
                      <p className="text-sm text-gray-600">Amazon - 2023</p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm học vấn
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm chứng chỉ
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CV */}
          <TabsContent value="cv">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý CV</CardTitle>
                <CardDescription>Upload và quản lý các phiên bản CV của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-lg font-medium text-gray-900">Upload CV mới</p>
                    <p className="text-sm text-gray-600 mt-1">Hỗ trợ định dạng PDF, DOCX (tối đa 10MB)</p>
                  </div>
                  <Button className="mt-4">Chọn file</Button>
                </div>

                {/* Existing CVs */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">CV đã upload</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">CV_NguyenVanA_Frontend.pdf</p>
                          <p className="text-sm text-gray-600">Uploaded 2 ngày trước • 1.2 MB</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Xem
                        </Button>
                        <Button variant="outline" size="sm">
                          Tải xuống
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Xóa
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">CV_NguyenVanA_Fullstack.pdf</p>
                          <p className="text-sm text-gray-600">Uploaded 1 tuần trước • 1.5 MB</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Xem
                        </Button>
                        <Button variant="outline" size="sm">
                          Tải xuống
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Online CV Builder */}
                <div className="border rounded-lg p-6 bg-blue-50">
                  <h4 className="font-medium text-gray-900 mb-2">Tạo CV trực tuyến</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Sử dụng công cụ tạo CV trực tuyến của chúng tôi để tạo CV chuyên nghiệp
                  </p>
                  <Button variant="outline">Tạo CV mới</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CandidateLayout>
  )
}
