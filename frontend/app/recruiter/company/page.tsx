"use client"

import { useState } from "react"
import RecruiterLayout from "@/components/recruiter-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building, Edit, Save, Upload, Users, Calendar } from "lucide-react"

export default function RecruiterCompany() {
  const [isEditing, setIsEditing] = useState(false)

  const companyInfo = {
    name: "TechCorp Vietnam",
    industry: "Công nghệ thông tin",
    size: "100-500 nhân viên",
    founded: "2015",
    website: "https://techcorp.vn",
    email: "hr@techcorp.vn",
    phone: "024-1234-5678",
    address: "Tầng 10, Tòa nhà ABC, 123 Đường XYZ, Cầu Giấy, Hà Nội",
    description:
      "TechCorp Vietnam là công ty công nghệ hàng đầu chuyên phát triển các giải pháp phần mềm cho doanh nghiệp. Chúng tôi tập trung vào việc tạo ra những sản phẩm công nghệ tiên tiến và môi trường làm việc năng động cho đội ngũ nhân viên.",
    mission: "Tạo ra những giải pháp công nghệ đột phá giúp doanh nghiệp phát triển bền vững",
    vision: "Trở thành công ty công nghệ hàng đầu Việt Nam trong lĩnh vực enterprise software",
    values: ["Đổi mới sáng tạo", "Làm việc nhóm", "Chất lượng cao", "Phát triển bền vững"],
    benefits: [
      "Lương thưởng cạnh tranh",
      "Bảo hiểm sức khỏe toàn diện",
      "Môi trường làm việc hiện đại",
      "Cơ hội đào tạo và phát triển",
      "Team building định kỳ",
      "Flexible working time",
      "Work from home",
      "Nghỉ phép có lương",
    ],
    culture:
      "Văn hóa công ty tập trung vào sự đổi mới, hợp tác và phát triển cá nhân. Chúng tôi khuyến khích nhân viên học hỏi, thử nghiệm và đóng góp ý tưởng mới.",
  }

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông tin công ty</h1>
            <p className="text-gray-600">Quản lý thông tin và hồ sơ công ty</p>
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

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">
              <Building className="mr-2 h-4 w-4" />
              Thông tin cơ bản
            </TabsTrigger>
            <TabsTrigger value="culture">
              <Users className="mr-2 h-4 w-4" />
              Văn hóa công ty
            </TabsTrigger>
            <TabsTrigger value="benefits">
              <Calendar className="mr-2 h-4 w-4" />
              Phúc lợi
            </TabsTrigger>
            <TabsTrigger value="media">
              <Upload className="mr-2 h-4 w-4" />
              Hình ảnh
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin công ty</CardTitle>
                    <CardDescription>Thông tin cơ bản về công ty</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Tên công ty</Label>
                        <Input id="companyName" defaultValue={companyInfo.name} disabled={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Ngành nghề</Label>
                        <Input id="industry" defaultValue={companyInfo.industry} disabled={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Quy mô</Label>
                        <Input id="size" defaultValue={companyInfo.size} disabled={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="founded">Năm thành lập</Label>
                        <Input id="founded" defaultValue={companyInfo.founded} disabled={!isEditing} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả công ty</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        defaultValue={companyInfo.description}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin liên hệ</CardTitle>
                    <CardDescription>Thông tin liên hệ và địa chỉ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" defaultValue={companyInfo.website} disabled={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={companyInfo.email} disabled={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input id="phone" defaultValue={companyInfo.phone} disabled={!isEditing} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Textarea id="address" rows={3} defaultValue={companyInfo.address} disabled={!isEditing} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo công ty</CardTitle>
                    <CardDescription>Upload logo công ty</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-32 h-32 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building className="h-16 w-16 text-white" />
                      </div>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Thay đổi logo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Thống kê nhanh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Số JD đang tuyển</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tổng ứng viên</span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lượt xem công ty</span>
                      <span className="font-semibold">2,345</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Company Culture */}
          <TabsContent value="culture">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tầm nhìn & Sứ mệnh</CardTitle>
                  <CardDescription>Định hướng phát triển của công ty</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mission">Sứ mệnh</Label>
                    <Textarea id="mission" rows={3} defaultValue={companyInfo.mission} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vision">Tầm nhìn</Label>
                    <Textarea id="vision" rows={3} defaultValue={companyInfo.vision} disabled={!isEditing} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Giá trị cốt lõi</CardTitle>
                  <CardDescription>Những giá trị mà công ty theo đuổi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {companyInfo.values.map((value, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {value}
                          {isEditing && <button className="ml-2 hover:text-red-500">×</button>}
                        </Badge>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input placeholder="Thêm giá trị mới" />
                        <Button size="sm">Thêm</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Văn hóa công ty</CardTitle>
                  <CardDescription>Mô tả về văn hóa và môi trường làm việc</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea rows={5} defaultValue={companyInfo.culture} disabled={!isEditing} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Benefits */}
          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle>Phúc lợi nhân viên</CardTitle>
                <CardDescription>Các chế độ đãi ngộ và phúc lợi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyInfo.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span>{benefit}</span>
                        {isEditing && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input placeholder="Thêm phúc lợi mới" />
                      <Button size="sm">Thêm</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hình ảnh công ty</CardTitle>
                  <CardDescription>Upload hình ảnh về văn phòng, team, hoạt động</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-lg font-medium text-gray-900">Upload hình ảnh</p>
                      <p className="text-sm text-gray-600 mt-1">Kéo thả hoặc click để chọn file</p>
                    </div>
                    <Button className="mt-4">Chọn hình ảnh</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Video giới thiệu</CardTitle>
                  <CardDescription>Video giới thiệu về công ty và văn hóa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input placeholder="URL video YouTube/Vimeo" disabled={!isEditing} />
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Video preview sẽ hiển thị ở đây</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  )
}
