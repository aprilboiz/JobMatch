"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Plus,
  X,
  Edit,
  Save,
  User,
  Briefcase,
  GraduationCap,
  Download,
  Trash2,
} from "lucide-react";
import { candidateApi } from "@/lib/api/candidate";
import { userApi } from "@/lib/api/user";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useToast } from "@/hooks/use-toast";
import type { CvResponse } from "@/types/api";

export default function CandidateProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState([
    "React",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Python",
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [cvFiles, setCvFiles] = useState<CvResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
  }>({});
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
  });

  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCVFiles();
    // Initialize form with user data
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const loadCVFiles = async () => {
    try {
      setLoading(true);
      const files = await candidateApi.getAllCVs();
      setCvFiles(files);
    } catch (error) {
      setError("Không thể tải danh sách CV");
      console.error("Failed to load CV files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Lỗi",
        description: "Chỉ hỗ trợ file PDF, DOC, DOCX",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "File không được vượt quá 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const response = await candidateApi.uploadCV(file);
      setCvFiles((prev) => [...prev, response]);
      toast({
        title: "Thành công",
        description: "Upload CV thành công",
      });
      // Reset input
      event.target.value = "";
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể upload CV. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error("Failed to upload CV:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCV = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa CV này?")) return;

    try {
      await candidateApi.deleteCV(id);
      setCvFiles((prev) => prev.filter((cv) => cv.id !== id));
      toast({
        title: "Thành công",
        description: "Xóa CV thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa CV. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error("Failed to delete CV:", error);
    }
  };

  const handleDownloadCV = async (id: number, fileName: string) => {
    try {
      // Use manual approach to see the actual filename being used
      const { blob, filename } = await candidateApi.downloadCV(id);
      console.log("Downloaded filename:", filename);
      console.log("Fallback filename:", fileName);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || fileName; // Use server filename or fallback
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Thành công",
        description: `Tải ${filename || fileName} thành công`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải CV. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error("Failed to download CV:", error);
    }
  };

  // Alternative manual approach if you need custom handling
  const handleDownloadCVManual = async (
    id: number,
    fallbackFileName: string
  ) => {
    try {
      const { blob, filename } = await candidateApi.downloadCV(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || fallbackFileName; // Use server filename or fallback
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Thành công",
        description: `Tải ${filename || fallbackFileName} thành công`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải CV. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error("Failed to download CV:", error);
    }
  };

  const handleSaveProfile = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    const errors: { fullName?: string; phoneNumber?: string } = {};

    // Validate required fields
    if (!profileForm.fullName.trim()) {
      errors.fullName = "Họ và tên không được để trống";
    } else if (
      profileForm.fullName.trim().length < 3 ||
      profileForm.fullName.trim().length > 50
    ) {
      errors.fullName = "Họ và tên phải có độ dài từ 3-50 ký tự";
    }

    if (!profileForm.phoneNumber.trim()) {
      errors.phoneNumber = "Số điện thoại không được để trống";
    } else {
      // Validate phone number format (10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(profileForm.phoneNumber.trim())) {
        errors.phoneNumber = "Số điện thoại phải có đúng 10 chữ số";
      }
    }

    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra thông tin và thử lại",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log("Saving profile:", profileForm);

      // Trim values before sending
      const trimmedData = {
        fullName: profileForm.fullName.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
      };

      await userApi.updateUser(trimmedData);
      await refreshUser(); // Refresh user data in context

      setIsEditing(false);
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);

      let errorMessage = "Không thể cập nhật thông tin. Vui lòng thử lại.";

      // Handle specific backend validation errors
      if (
        error instanceof Error &&
        error.message.includes("Validation failed")
      ) {
        errorMessage = "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof profileForm,
    value: string
  ) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleCancelEdit = () => {
    // Reset form to original user data
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
    // Clear validation errors
    setValidationErrors({});
    setIsEditing(false);
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={loadCVFiles} />;
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <p className="text-gray-600">
              Quản lý thông tin cá nhân và CV của bạn
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                disabled={saving}
              >
                Hủy
              </Button>
            )}
            <Button
              onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              variant={isEditing ? "default" : "outline"}
              disabled={loading || saving}
            >
              {loading || saving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : isEditing ? (
                <Save className="mr-2 h-4 w-4" />
              ) : (
                <Edit className="mr-2 h-4 w-4" />
              )}
              {saving
                ? "Đang lưu..."
                : isEditing
                ? "Lưu thay đổi"
                : "Chỉnh sửa"}
            </Button>
          </div>
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
                <CardDescription>
                  Cập nhật thông tin cơ bản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      disabled={!isEditing}
                      className={
                        validationErrors.fullName ? "border-red-500" : ""
                      }
                    />
                    {validationErrors.fullName && (
                      <p className="text-sm text-red-500">
                        {validationErrors.fullName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Số điện thoại</Label>
                    <Input
                      id="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      disabled={!isEditing}
                      className={
                        validationErrors.phoneNumber ? "border-red-500" : ""
                      }
                    />
                    {validationErrors.phoneNumber && (
                      <p className="text-sm text-red-500">
                        {validationErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Địa chỉ</Label>
                    <Input
                      id="location"
                      defaultValue="Hà Nội, Việt Nam"
                      disabled={!isEditing}
                    />
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
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-sm"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-red-500"
                          >
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
                <CardDescription>
                  Thêm và quản lý kinh nghiệm làm việc của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          Frontend Developer
                        </h3>
                        <p className="text-blue-600 font-medium">
                          TechCorp Vietnam
                        </p>
                        <p className="text-sm text-gray-600">
                          01/2022 - Hiện tại
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          Phát triển và duy trì các ứng dụng web sử dụng React,
                          TypeScript. Tham gia xây dựng hệ thống quản lý nội bộ
                          phục vụ 1000+ người dùng.
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
                        <h3 className="font-semibold text-gray-900">
                          Junior Frontend Developer
                        </h3>
                        <p className="text-blue-600 font-medium">StartupXYZ</p>
                        <p className="text-sm text-gray-600">
                          06/2021 - 12/2021
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          Học hỏi và phát triển kỹ năng frontend, tham gia dự án
                          xây dựng website thương mại điện tử sử dụng React và
                          Redux.
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
                <CardDescription>
                  Thông tin về trình độ học vấn và chứng chỉ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          Cử nhân Công nghệ Thông tin
                        </h3>
                        <p className="text-blue-600 font-medium">
                          Đại học Bách Khoa Hà Nội
                        </p>
                        <p className="text-sm text-gray-600">2017 - 2021</p>
                        <p className="text-sm text-gray-700 mt-2">
                          GPA: 3.2/4.0 - Chuyên ngành Kỹ thuật Phần mềm
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
                    Thêm học vấn
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CV Management */}
          <TabsContent value="cv">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý CV</CardTitle>
                <CardDescription>
                  Upload và quản lý các phiên bản CV của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-lg font-medium text-gray-900">
                      Upload CV mới
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Hỗ trợ định dạng PDF, DOCX (tối đa 10MB)
                    </p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="cv-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="cv-upload">
                      <Button asChild disabled={uploading}>
                        <span>
                          {uploading ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Đang upload...
                            </>
                          ) : (
                            "Chọn file"
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Existing CVs */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">CV đã upload</h4>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : cvFiles.length > 0 ? (
                    <div className="space-y-3">
                      {cvFiles.map((cv) => (
                        <div
                          key={cv.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {cv.fileName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {/* Uploaded {formatDate(cv.uploadedAt)} • {formatFileSize(cv.fileSize)} */}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadCV(cv.id, cv.originalFileName)
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Tải xuống
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteCV(cv.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Chưa có CV nào được upload</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
