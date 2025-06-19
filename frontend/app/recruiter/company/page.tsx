"use client";

import { useState, useEffect } from "react";
import RecruiterLayout from "@/components/recruiter-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building,
  Edit,
  Save,
  Upload,
  Users,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { recruiterApi } from "@/lib/api/recruiter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import type { CompanyResponse, CompanyRequest } from "@/types/api";

export default function RecruiterCompany() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyResponse | null>(null);
  const [formData, setFormData] = useState<CompanyRequest>({
    name: "",
    website: "",
    phoneNumber: "",
    email: "",
    address: "",
    companySize: "",
    industry: "",
    description: "",
  });

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is authenticated and is recruiter
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      router.push("/auth/login");
      return;
    }

    if (user.role.roleName !== "RECRUITER") {
      console.log("User is not a recruiter, redirecting");
      router.push("/");
      return;
    }

    // Since backend doesn't have GET endpoint yet, we'll start with empty form
    initializeEmptyForm();
  }, [user, authLoading, router]);

  const initializeEmptyForm = () => {
    console.log("Initializing empty company form (GET endpoint not available)");
    setLoading(false);
    setError(null);

    // Set empty company data
    const emptyCompany: CompanyResponse = {
      id: 0,
      name: "",
      website: "",
      phoneNumber: "",
      email: "",
      address: "",
      companySize: "",
      industry: "",
      description: "",
    };

    setCompanyData(emptyCompany);
    setFormData({
      name: "",
      website: "",
      phoneNumber: "",
      email: "",
      address: "",
      companySize: "",
      industry: "",
      description: "",
    });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên công ty không được để trống",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      toast({
        title: "Lỗi",
        description: "Email không được để trống",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log("Saving company profile:", formData);

      await recruiterApi.updateCompanyProfile(formData);

      // Update local state with saved data since we don't have GET endpoint
      const updatedCompany: CompanyResponse = {
        id: companyData?.id || 0,
        ...formData,
      };
      setCompanyData(updatedCompany);

      setIsEditing(false);
      toast({
        title: "Thành công",
        description: "Thông tin công ty đã được cập nhật",
      });
    } catch (error) {
      console.error("Failed to save company profile:", error);
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật thông tin công ty",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CompanyRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <RecruiterLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </RecruiterLayout>
    );
  }

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </RecruiterLayout>
    );
  }

  if (error) {
    return (
      <RecruiterLayout>
        <ErrorMessage message={error} onRetry={initializeEmptyForm} />
      </RecruiterLayout>
    );
  }

  // Don't show "not found" message since we start with empty form
  // when GET endpoint is not available
  if (!companyData) {
    return (
      <RecruiterLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thông tin công ty
            </h1>
            <p className="text-gray-600">Quản lý thông tin và hồ sơ công ty</p>
          </div>
          <div className="flex space-x-2">
            {isEditing && (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original company data
                  setFormData({
                    name: companyData.name || "",
                    website: companyData.website || "",
                    phoneNumber: companyData.phoneNumber || "",
                    email: companyData.email || "",
                    address: companyData.address || "",
                    companySize: companyData.companySize || "",
                    industry: companyData.industry || "",
                    description: companyData.description || "",
                  });
                }}
                variant="outline"
                disabled={saving}
              >
                Hủy
              </Button>
            )}
            <Button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              variant={isEditing ? "default" : "outline"}
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Đang lưu...
                </>
              ) : isEditing ? (
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
        </div>

        {/* Alert about company setup */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Lưu ý:</strong> Nếu bạn gặp lỗi khi lưu thông tin công ty,
            có thể tài khoản của bạn chưa được gán công ty. Vui lòng liên hệ
            quản trị viên để được hỗ trợ thiết lập thông tin công ty.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">
              <Building className="mr-2 h-4 w-4" />
              Thông tin cơ bản
            </TabsTrigger>
            {/* <TabsTrigger value="culture">
              <Users className="mr-2 h-4 w-4" />
              Văn hóa công ty
            </TabsTrigger> */}
            {/* <TabsTrigger value="benefits">
              <Calendar className="mr-2 h-4 w-4" />
              Phúc lợi
            </TabsTrigger>
            <TabsTrigger value="media">
              <Upload className="mr-2 h-4 w-4" />
              Hình ảnh
            </TabsTrigger> */}
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin công ty</CardTitle>
                    <CardDescription>
                      Thông tin cơ bản về công ty
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Tên công ty</Label>
                        <Input
                          id="companyName"
                          value={isEditing ? formData.name : companyData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Ngành nghề</Label>
                        <Input
                          id="industry"
                          value={
                            isEditing ? formData.industry : companyData.industry
                          }
                          onChange={(e) =>
                            handleInputChange("industry", e.target.value)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Quy mô</Label>
                        <Input
                          id="size"
                          value={
                            isEditing
                              ? formData.companySize
                              : companyData.companySize
                          }
                          onChange={(e) =>
                            handleInputChange("companySize", e.target.value)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={
                            isEditing
                              ? formData.website
                              : companyData.website || ""
                          }
                          onChange={(e) =>
                            handleInputChange("website", e.target.value)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả công ty</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        value={
                          isEditing
                            ? formData.description
                            : companyData.description || ""
                        }
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin liên hệ</CardTitle>
                    <CardDescription>
                      Thông tin liên hệ và địa chỉ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={
                            isEditing ? formData.email : companyData.email || ""
                          }
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={
                            isEditing
                              ? formData.phoneNumber
                              : companyData.phoneNumber || ""
                          }
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Textarea
                        id="address"
                        rows={3}
                        value={
                          isEditing ? formData.address : companyData.address
                        }
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        disabled={!isEditing}
                      />
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
                      <span className="text-sm text-gray-600">
                        Số JD đang tuyển
                      </span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Tổng ứng viên
                      </span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {/* <span className="text-sm text-gray-600">
                        Lượt xem công ty
                      </span>
                      <span className="font-semibold">2,345</span> */}
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
                  <CardDescription>
                    Định hướng phát triển của công ty
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mission">Sứ mệnh</Label>
                    <Textarea
                      id="mission"
                      rows={3}
                      defaultValue=""
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vision">Tầm nhìn</Label>
                    <Textarea
                      id="vision"
                      rows={3}
                      defaultValue=""
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Giá trị cốt lõi</CardTitle>
                  <CardDescription>
                    Những giá trị mà công ty theo đuổi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {[].map((value, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm"
                        >
                          {value}
                          {isEditing && (
                            <button className="ml-2 hover:text-red-500">
                              ×
                            </button>
                          )}
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
                  <CardDescription>
                    Mô tả về văn hóa và môi trường làm việc
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea rows={5} defaultValue="" disabled={!isEditing} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Benefits */}
          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle>Phúc lợi nhân viên</CardTitle>
                <CardDescription>
                  Các chế độ đãi ngộ và phúc lợi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[].map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span>{benefit}</span>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
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
                  <CardDescription>
                    Upload hình ảnh về văn phòng, team, hoạt động
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-lg font-medium text-gray-900">
                        Upload hình ảnh
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Kéo thả hoặc click để chọn file
                      </p>
                    </div>
                    <Button className="mt-4">Chọn hình ảnh</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Video giới thiệu</CardTitle>
                  <CardDescription>
                    Video giới thiệu về công ty và văn hóa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="URL video YouTube/Vimeo"
                      disabled={!isEditing}
                    />
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">
                        Video preview sẽ hiển thị ở đây
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
}
