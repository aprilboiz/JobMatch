"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Users,
  Briefcase,
  Calendar,
  Filter,
  X,
  FileText,
} from "lucide-react";
import { recruiterApi } from "@/lib/api/recruiter";
import { ApplicationResponse, JobResponse } from "@/types/api";
import RecruiterLayout from "@/components/recruiter-layout";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  REVIEWING: "bg-blue-100 text-blue-800",
  INTERVIEW: "bg-purple-100 text-purple-800",
} as const;

const statusLabels = {
  PENDING: "Chờ xử lý",
  ACCEPTED: "Đã chấp nhận",
  REJECTED: "Đã từ chối",
  REVIEWING: "Đang xem xét",
  INTERVIEW: "Phỏng vấn",
} as const;

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    reviewing: 0,
    interview: 0,
  });

  const [jobs, setJobs] = useState<JobResponse[]>([]);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, searchTerm, statusFilter, jobFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await recruiterApi.getAllCompanyApplications();
      setApplications(data);

      // Extract unique jobs from applications
      const uniqueJobs: JobResponse[] = [];
      const jobIds = new Set<string>();

      data.forEach((app) => {
        if (!jobIds.has(app.jobId)) {
          jobIds.add(app.jobId);
          // Create a mock job object from application data
          uniqueJobs.push({
            id: parseInt(app.jobId),
            title: app.jobTitle,
            jobType: "FULL_TIME", // Default value
            description: "",
            location: "",
            salary: {
              salaryType: "NEGOTIABLE",
            },
            applicationDeadline: "",
            numberOfOpenings: 1,
            companyId: "",
            recruiterId: "",
            status: "ACTIVE",
          });
        }
      });

      setJobs(uniqueJobs);

      // Calculate statistics
      const total = data.length;
      const pending = data.filter((app) => app.status === "PENDING").length;
      const accepted = data.filter((app) => app.status === "ACCEPTED").length;
      const rejected = data.filter((app) => app.status === "REJECTED").length;
      const reviewing = data.filter((app) => app.status === "REVIEWING").length;
      const interview = data.filter((app) => app.status === "INTERVIEW").length;

      setStats({ total, pending, accepted, rejected, reviewing, interview });
    } catch (error: any) {
      console.error("Error loading applications:", error);
      if (error.message.includes("Company not found")) {
        setError(
          "Bạn chưa có thông tin công ty. Vui lòng cập nhật thông tin công ty trước khi xem danh sách ứng viên."
        );
      } else if (error.message.includes("No jobs found")) {
        setError(
          "Bạn chưa đăng tin tuyển dụng nào. Hãy đăng tin tuyển dụng để nhận được hồ sơ ứng viên."
        );
      } else {
        setError("Không thể tải danh sách ứng viên. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = applications;

    // Search filter (search by job title and company name for now)
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Job filter
    if (jobFilter !== "all") {
      filtered = filtered.filter((app) => app.jobId === jobFilter);
    }

    setFilteredApplications(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setJobFilter("all");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Quản lý ứng viên</h1>
          <p className="text-muted-foreground">
            Xem và quản lý tất cả hồ sơ ứng viên cho các tin tuyển dụng của công
            ty
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Chờ xử lý
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đang xem xét
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.reviewing}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Phỏng vấn
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.interview}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đã chấp nhận
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.accepted}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đã từ chối
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Bộ lọc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tìm kiếm</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tên vị trí, công ty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                        <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
                        <SelectItem value="INTERVIEW">Phỏng vấn</SelectItem>
                        <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
                        <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Vị trí tuyển dụng
                    </label>
                    <Select value={jobFilter} onValueChange={setJobFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vị trí" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vị trí</SelectItem>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(searchTerm ||
                  statusFilter !== "all" ||
                  jobFilter !== "all") && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Xóa bộ lọc
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applications List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Danh sách ứng tuyển ({filteredApplications.length})
                </h2>
              </div>

              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      {applications.length === 0
                        ? "Chưa có ứng viên nào ứng tuyển vào các vị trí của bạn."
                        : "Không tìm thấy ứng tuyển nào phù hợp với bộ lọc."}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card
                      key={application.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">
                                Đơn ứng tuyển #{application.id}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Briefcase className="h-4 w-4" />
                                <span>Vị trí: {application.jobTitle}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Công ty: {application.companyName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge
                              className={getStatusColor(application.status)}
                            >
                              {getStatusLabel(application.status)}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(application.appliedOn)}
                            </p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Ngày ứng tuyển:{" "}
                              {formatDate(application.appliedOn)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Xem chi tiết
                            </Button>
                            {application.status === "PENDING" && (
                              <>
                                <Button size="sm" variant="default">
                                  Chấp nhận
                                </Button>
                                <Button size="sm" variant="destructive">
                                  Từ chối
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </RecruiterLayout>
  );
}
