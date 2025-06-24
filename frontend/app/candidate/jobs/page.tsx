"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  SearchIcon,
  MapPinIcon,
  CalendarIcon,
  DollarSignIcon,
  BuildingIcon,
} from "lucide-react";
import { jobsApi, JobSearchParams } from "@/lib/api/jobs";
import { JobResponse, PaginatedResponse } from "@/types/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  // Debug state changes
  useEffect(() => {
    console.log("🔄 State changed:", {
      jobsCount: jobs.length,
      loading,
      error,
      totalJobs,
      currentPage,
      totalPages,
    });
  }, [jobs, loading, error, totalJobs, currentPage, totalPages]);

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minSalary, setMinSalary] = useState<number | undefined>();
  const [maxSalary, setMaxSalary] = useState<number | undefined>();

  const jobTypeOptions = [
    { value: "FULL_TIME", label: "Toàn thời gian" },
    { value: "PART_TIME", label: "Bán thời gian" },
    { value: "INTERNSHIP", label: "Thực tập" },
    { value: "CONTRACT", label: "Hợp đồng" },
    { value: "REMOTE", label: "Làm việc từ xa" },
  ];

  const formatSalary = (salary: any) => {
    if (!salary) return "Thương lượng";

    switch (salary.salaryType) {
      case "NEGOTIABLE":
        return "Thương lượng";
      case "COMPETITIVE":
        return "Lương cạnh tranh";
      case "FIXED":
        return salary.minSalary
          ? `${salary.minSalary.toLocaleString()} ${salary.currency || "VND"}/${
              salary.salaryPeriod?.toLowerCase() || "tháng"
            }`
          : "Thương lượng";
      case "RANGE":
        return salary.minSalary && salary.maxSalary
          ? `${salary.minSalary.toLocaleString()} - ${salary.maxSalary.toLocaleString()} ${
              salary.currency || "VND"
            }/${salary.salaryPeriod?.toLowerCase() || "tháng"}`
          : "Thương lượng";
      default:
        return "Thương lượng";
    }
  };

  const formatJobType = (jobType: string) => {
    const option = jobTypeOptions.find((opt) => opt.value === jobType);
    return option ? option.label : jobType;
  };

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString("vi-VN");
  };
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "CLOSED":
        return "outline";
      case "EXPIRED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Đang tuyển";
      case "CLOSED":
        return "Đã đóng";
      case "EXPIRED":
        return "Hết hạn";
      default:
        return status;
    }
  };
  const loadJobs = async (page: number = 0, useSearch: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 loadJobs called with:", { page, useSearch });

      let result: PaginatedResponse<JobResponse>;

      if (
        useSearch &&
        (searchKeyword ||
          selectedJobType ||
          selectedLocation ||
          minSalary ||
          maxSalary)
      ) {
        // Use search API with filters
        const searchParams: JobSearchParams = {
          page,
          size: 10,
          sort: "createdAt,desc",
        };

        if (searchKeyword) searchParams.keyword = searchKeyword;
        if (selectedJobType) searchParams.jobType = selectedJobType as any;
        if (selectedLocation) searchParams.location = selectedLocation;
        if (minSalary) searchParams.minSalary = minSalary;
        if (maxSalary) searchParams.maxSalary = maxSalary;
        searchParams.status = "OPEN"; // Only show open jobs for candidates

        console.log("🔍 Using search API with params:", searchParams);
        result = await jobsApi.searchJobs(searchParams);
      } else {
        // Use general get all jobs API
        console.log("📋 Using getAllJobs API");
        result = await jobsApi.getAllJobs(page, 10, "createdAt,desc");
      }

      console.log("✅ API result:", result);
      console.log("📊 Jobs data:", result?.data);
      console.log("📝 Jobs count:", result?.data?.length);

      setJobs(result?.data || []);
      setTotalPages(result?.totalPages || 0);
      setTotalJobs(result?.total || 0);
      setCurrentPage(page);

      console.log(
        "🎯 State updated - jobs count:",
        (result?.data || []).length
      );
    } catch (err: any) {
      console.error("❌ Error loading jobs:", err);
      setError(err.message || "Không thể tải danh sách việc làm");
      setJobs([]);
      setTotalPages(0);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };
  // Load jobs on component mount
  useEffect(() => {
    console.log("🚀 Component mounted, loading jobs...");
    loadJobs(0, false);
  }, []);

  const handleSearch = () => {
    console.log("🔍 Handling search...");
    loadJobs(0, true);
  };

  const handleClearFilters = () => {
    console.log("🧹 Clearing filters...");
    setSearchKeyword("");
    setSelectedJobType("");
    setSelectedLocation("");
    setMinSalary(undefined);
    setMaxSalary(undefined);
    loadJobs(0, false);
  };
  const handlePageChange = (newPage: number) => {
    const hasFilters = !!(
      searchKeyword ||
      selectedJobType ||
      selectedLocation ||
      minSalary ||
      maxSalary
    );
    loadJobs(newPage, hasFilters);
  };
  if (loading && (!jobs || jobs.length === 0)) {
    console.log("🔄 Loading state - showing spinner");
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  console.log("🎨 Rendering jobs page:", {
    loading,
    jobsCount: jobs?.length,
    error,
    totalJobs,
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và lọc</CardTitle>
          <CardDescription>
            Sử dụng các bộ lọc để tìm công việc phù hợp với bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề, mô tả công việc..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <LoadingSpinner className="h-4 w-4" /> : "Tìm kiếm"}
            </Button>
          </div>
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedJobType} onValueChange={setSelectedJobType}>
              <SelectTrigger>
                <SelectValue placeholder="Loại công việc" />
              </SelectTrigger>
              <SelectContent>
                {jobTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Địa điểm"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Lương tối thiểu"
              value={minSalary || ""}
              onChange={(e) =>
                setMinSalary(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />

            <Input
              type="number"
              placeholder="Lương tối đa"
              value={maxSalary || ""}
              onChange={(e) =>
                setMaxSalary(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>{" "}
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
            <Button variant="outline" onClick={() => loadJobs(0, false)}>
              🔄 Force Reload
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log("Current jobs state:", jobs)}
            >
              🐛 Log Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => loadJobs(currentPage, false)}
        />
      )}{" "}
      {/* Jobs List */}
      <div className="space-y-6">
        {(() => {
          console.log("🔍 Jobs list render check:", {
            jobs,
            jobsLength: jobs?.length,
            loading,
          });
          return null;
        })()}
        {(!jobs || jobs.length === 0) && !loading ? (
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">
                Không tìm thấy việc làm nào phù hợp với tiêu chí tìm kiếm của
                bạn.
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="mt-4"
              >
                Xóa bộ lọc và xem tất cả
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobs?.map((job) => {
            console.log("🎯 Rendering job:", job.id, job.title);
            return (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl hover:text-primary cursor-pointer">
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BuildingIcon className="h-4 w-4" />
                          <span>Công ty ID: {job.companyId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(job.status)}>
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">
                    {job.description}
                  </CardDescription>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {formatJobType(job.jobType)}
                    </Badge>
                    <Badge variant="outline">
                      <DollarSignIcon className="h-3 w-3 mr-1" />
                      {formatSalary(job.salary)}
                    </Badge>
                    <Badge variant="outline">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Hạn nộp: {formatDeadline(job.applicationDeadline)}
                    </Badge>
                    <Badge variant="outline">
                      {job.numberOfOpenings} vị trí
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      ID: {job.id}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>{" "}
                      <Button size="sm" disabled={job.status !== "OPEN"}>
                        Ứng tuyển
                      </Button>
                    </div>
                  </div>
                </CardContent>{" "}
              </Card>
            );
          })
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
          >
            Trang trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNumber = currentPage < 3 ? i : currentPage - 2 + i;
              if (pageNumber >= totalPages) return null;

              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber + 1}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || loading}
          >
            Trang sau
          </Button>
        </div>
      )}{" "}
      {/* Results Summary */}
      <div className="text-center text-sm text-muted-foreground">
        Hiển thị {jobs?.length || 0} / {totalJobs} việc làm
        {totalPages > 1 && ` • Trang ${currentPage + 1} / ${totalPages}`}
      </div>
    </div>
  );
}
