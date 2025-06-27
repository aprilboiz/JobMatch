"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { recruiterApi } from "@/lib/api/recruiter";
import { CompanyRequest, UpdateRecruiterProfileRequest } from "@/types/api";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  User,
} from "lucide-react";
import RecruiterLayout from "@/components/recruiter-layout";

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile data state
  const [profileData, setProfileData] = useState<UpdateRecruiterProfileRequest>(
    {
      fullName: "",
      phoneNumber: "",
      companyId: 1,
    }
  );
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {}
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const [formData, setFormData] = useState<CompanyRequest>({
    name: "",
    description: "",
    website: "",
    address: "",
    phoneNumber: "",
    email: "",
    companySize: "",
    industry: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role.roleName !== "RECRUITER") {
      router.push("/auth/login");
      return;
    }

    // Load existing company data if available
    loadCompanyData();
    loadProfileData();
  }, [user, router]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: Backend doesn't provide a GET endpoint for company data
      // So we start with an empty form
      const companyData = await recruiterApi.getCompanyProfile();
      if (companyData) {
        setFormData({
          name: companyData.name || "",
          description: companyData.description || "",
          website: companyData.website || "",
          address: companyData.address || "",
          phoneNumber: companyData.phoneNumber || "",
          email: companyData.email || "",
          companySize: companyData.companySize || "",
          industry: companyData.industry || "",
        });
      }
    } catch (error) {
      console.error("Error loading company data:", error);
      // Start with empty form if no data available
    } finally {
      setLoading(false);
    }
  };
  const loadProfileData = async () => {
    try {
      const userProfile = await recruiterApi.getUserProfile();
      if (userProfile) {
        setProfileData({
          fullName: userProfile.fullName || "",
          phoneNumber: userProfile.phoneNumber || "",
          companyId: 1, // Default company ID - you may want to get this from somewhere else
        });
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Tên công ty là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên công ty phải có ít nhất 2 ký tự";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    if (!formData.companySize.trim()) {
      newErrors.companySize = "Quy mô công ty là bắt buộc";
    } else {
      // Validate company size format
      const validSizes = [
        "1-10",
        "10-50",
        "50-100",
        "100-500",
        "500-1000",
        "1000+",
      ];
      if (!validSizes.includes(formData.companySize)) {
        newErrors.companySize =
          "Quy mô công ty không hợp lệ (VD: 1-10, 10-50, 50-100, 100-500, 500-1000, 1000+)";
      }
    }

    if (!formData.industry.trim()) {
      newErrors.industry = "Ngành nghề là bắt buộc";
    }

    // Optional fields validation (only if provided)
    if (formData.phoneNumber && !/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "Số điện thoại không hợp lệ (chỉ chứa số, +, -, space, ())";
    }

    if (formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    }

    if (formData.website) {
      if (!/^https?:\/\/.+\..+/.test(formData.website)) {
        newErrors.website =
          "Website phải có định dạng đúng (VD: https://example.com)";
      }
    }

    // Description length validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Mô tả công ty không được vượt quá 1000 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (!profileData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9+\-\s()]+$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    if (!profileData.companyId || profileData.companyId < 1) {
      newErrors.companyId = "Company ID là bắt buộc";
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await recruiterApi.updateCompanyProfile(formData);

      setSuccess("Thông tin công ty đã được cập nhật thành công!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error updating company profile:", error);

      // Use the error message from API if available
      const errorMessage =
        error.message ||
        "Có lỗi xảy ra khi cập nhật thông tin công ty. Vui lòng thử lại.";
      setError(errorMessage);

      // Handle specific cases that require redirect
      if (
        error.response?.status === 401 ||
        errorMessage.includes("đăng nhập")
      ) {
        router.push("/auth/login");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    try {
      setSavingProfile(true);
      setError(null);
      setSuccess(null);

      await recruiterApi.updateRecruiterProfile(profileData);

      setSuccess("Thông tin cá nhân đã được cập nhật thành công!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error);

      // Use the error message from API if available
      const errorMessage =
        error.message ||
        "Có lỗi xảy ra khi cập nhật thông tin cá nhân. Vui lòng thử lại.";
      setError(errorMessage);

      // Handle specific cases that require redirect
      if (
        error.response?.status === 401 ||
        errorMessage.includes("đăng nhập")
      ) {
        router.push("/auth/login");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleInputChange = (
    field: keyof CompanyRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };
  const handleProfileInputChange = (
    field: keyof UpdateRecruiterProfileRequest,
    value: string | number
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </RecruiterLayout>
    );
  }
  return (
    <RecruiterLayout>
      <div className="container mx-auto py-6 space-y-6">
        {" "}
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Thông tin cá nhân và công ty</h1>
        </div>
        {error && error.includes("chưa được gán công ty") && (
          <Alert variant="destructive">
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">
                  Tài khoản chưa được thiết lập công ty
                </p>
                <p>{error}</p>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>
                    <strong>Hướng dẫn:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Liên hệ quản trị viên hệ thống</li>
                    <li>Yêu cầu tạo thông tin công ty cho tài khoản của bạn</li>
                    <li>
                      Sau khi được thiết lập, bạn có thể cập nhật thông tin công
                      ty tại đây
                    </li>
                  </ol>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}{" "}
        {error && !error.includes("chưa được gán công ty") && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Họ và tên *
                  </Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) =>
                      handleProfileInputChange("fullName", e.target.value)
                    }
                    placeholder="Nhập họ và tên"
                    className={profileErrors.fullName ? "border-red-500" : ""}
                  />
                  {profileErrors.fullName && (
                    <p className="text-sm text-red-500">
                      {profileErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profilePhoneNumber"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Số điện thoại *
                  </Label>
                  <Input
                    id="profilePhoneNumber"
                    value={profileData.phoneNumber}
                    onChange={(e) =>
                      handleProfileInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="Nhập số điện thoại"
                    className={
                      profileErrors.phoneNumber ? "border-red-500" : ""
                    }
                  />
                  {profileErrors.phoneNumber && (
                    <p className="text-sm text-red-500">
                      {profileErrors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Company ID */}
                {/* <div className="space-y-2">
                  <Label
                    htmlFor="companyId"
                    className="flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Company ID *
                  </Label>
                  <Input
                    id="companyId"
                    type="number"
                    min="1"
                    value={profileData.companyId}
                    onChange={(e) =>
                      handleProfileInputChange(
                        "companyId",
                        parseInt(e.target.value) || 1
                      )
                    }
                    placeholder="Nhập Company ID"
                    className={profileErrors.companyId ? "border-red-500" : ""}
                  />
                  {profileErrors.companyId && (
                    <p className="text-sm text-red-500">
                      {profileErrors.companyId}
                    </p>
                  )}
                </div> */}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2"
                >
                  {savingProfile && <LoadingSpinner size="sm" />}
                  {savingProfile ? "Đang lưu..." : "Cập nhật thông tin"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>{" "}
        {/* Company Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Thông tin công ty
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin công ty của bạn để thu hút ứng viên tốt nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Tên công ty *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên công ty"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>{" "}
                {/* Company Size */}
                <div className="space-y-2">
                  <Label
                    htmlFor="companySize"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Quy mô công ty *
                  </Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) =>
                      handleInputChange("companySize", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.companySize ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Chọn quy mô công ty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 nhân viên</SelectItem>
                      <SelectItem value="10-50">10-50 nhân viên</SelectItem>
                      <SelectItem value="50-100">50-100 nhân viên</SelectItem>
                      <SelectItem value="100-500">100-500 nhân viên</SelectItem>
                      <SelectItem value="500-1000">
                        500-1000 nhân viên
                      </SelectItem>
                      <SelectItem value="1000+">1000+ nhân viên</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.companySize && (
                    <p className="text-sm text-red-500">{errors.companySize}</p>
                  )}
                </div>
                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Số điện thoại
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="Nhập số điện thoại"
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>{" "}
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Nhập email công ty"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                {/* Website */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    placeholder="https://example.com"
                    className={errors.website ? "border-red-500" : ""}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website}</p>
                  )}
                </div>{" "}
                {/* Industry */}
                <div className="space-y-2">
                  <Label htmlFor="industry" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Ngành nghề *
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) =>
                      handleInputChange("industry", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.industry ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Chọn ngành nghề" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">
                        Công nghệ thông tin
                      </SelectItem>
                      <SelectItem value="Finance">
                        Tài chính - Ngân hàng
                      </SelectItem>
                      <SelectItem value="Healthcare">
                        Y tế - Chăm sóc sức khỏe
                      </SelectItem>
                      <SelectItem value="Education">
                        Giáo dục - Đào tạo
                      </SelectItem>
                      <SelectItem value="Manufacturing">
                        Sản xuất - Chế tạo
                      </SelectItem>
                      <SelectItem value="Retail">
                        Bán lẻ - Thương mại
                      </SelectItem>
                      <SelectItem value="Marketing">
                        Marketing - Quảng cáo
                      </SelectItem>
                      <SelectItem value="Construction">
                        Xây dựng - Kiến trúc
                      </SelectItem>
                      <SelectItem value="Logistics">
                        Logistics - Vận tải
                      </SelectItem>
                      <SelectItem value="Tourism">
                        Du lịch - Khách sạn
                      </SelectItem>
                      <SelectItem value="Media">
                        Truyền thông - Báo chí
                      </SelectItem>
                      <SelectItem value="Legal">Pháp lý - Luật</SelectItem>
                      <SelectItem value="Agriculture">Nông nghiệp</SelectItem>
                      <SelectItem value="Design">
                        Thiết kế - Sáng tạo
                      </SelectItem>
                      <SelectItem value="Other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-red-500">{errors.industry}</p>
                  )}
                </div>
                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Nhập địa chỉ công ty"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>
                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Mô tả công ty</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Mô tả về công ty, văn hóa, môi trường làm việc..."
                    rows={6}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving && <LoadingSpinner size="sm" />}
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/recruiter/dashboard")}
                >
                  Hủy
                </Button>{" "}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  );
}
