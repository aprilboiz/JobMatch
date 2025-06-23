"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { jobsApi } from "@/lib/api/jobs";
import type { Job, CreateJobRequest, SalaryDto } from "@/types/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import RecruiterLayout from "@/components/recruiter-layout";

const jobTypes = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
  { value: "REMOTE", label: "Remote" },
];

const salaryTypes = [
  { value: "FIXED", label: "Fixed Salary" },
  { value: "RANGE", label: "Salary Range" },
  { value: "NEGOTIABLE", label: "Negotiable" },
  { value: "COMPETITIVE", label: "Competitive" },
];

const currencies = [
  { value: "USD", label: "USD" },
  { value: "VND", label: "VND" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "JPY", label: "JPY" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
];

const salaryPeriods = [
  { value: "ANNUAL", label: "Annual" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "HOURLY", label: "Hourly" },
];

interface JobFormData {
  title: string;
  jobType: string;
  salary: SalaryDto;
  openings: number;
  applicationDeadline: string;
  description: string;
  location: string;
}

const initialFormData: JobFormData = {
  title: "",
  jobType: "",
  salary: {
    salaryType: "FIXED",
    currency: "USD",
    salaryPeriod: "ANNUAL",
  },
  openings: 1,
  applicationDeadline: "",
  description: "",
  location: "",
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const { toast } = useToast(); // Helper function to refresh jobs with better handling
  const refreshJobsList = async (showToast = false, forceDelay = false) => {
    try {
      console.log("Refreshing jobs list..."); // Add a small delay if requested to allow backend processing
      if (forceDelay) {
        console.log("Waiting for backend processing...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      const response = await jobsApi.getMyJobs();

      const jobsData = response.data || [];
      console.log("Jobs data refreshed:", jobsData);
      console.log("Current jobs count:", jobsData.length);
      console.log("Refresh - setting jobs state with:", jobsData);

      setJobs(jobsData);

      console.log("Refresh - jobs state should be updated now");

      if (showToast) {
        toast({
          title: "Đã làm mới",
          description: `Danh sách việc làm đã được cập nhật (${jobsData.length} việc làm).`,
        });
      }
    } catch (error: any) {
      console.error("Failed to refresh jobs:", error);
      if (showToast) {
        toast({
          title: "Lỗi",
          description: "Không thể làm mới danh sách việc làm.",
          variant: "destructive",
        });
      }
    }
  };
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching jobs...");

      // Use /me/jobs endpoint to get current recruiter's jobs
      const response = await jobsApi.getMyJobs();

      console.log("Fetch jobs response:", response);
      console.log("Response data array:", response.data);
      console.log("Response data length:", response.data?.length);

      const jobsData = response.data || [];
      console.log("Jobs data:", jobsData);
      console.log("Jobs data length:", jobsData.length);
      console.log("Setting jobs state with:", jobsData);

      setJobs(jobsData);

      console.log("Jobs state should be updated now");
    } catch (error: any) {
      console.error("Failed to fetch jobs:", error);

      // Handle authentication errors specifically
      if (
        error.message?.includes("Authentication failed") ||
        error.message?.includes("token") ||
        error.message?.includes("credentials")
      ) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // The API client will handle redirecting to login
      } else {
        setError("Không thể tải danh sách việc làm. Vui lòng thử lại.");
      }

      setJobs([]); // Ensure jobs is always an array
      toast({
        title: "Lỗi",
        description: error.message?.includes("Authentication failed")
          ? "Phiên đăng nhập đã hết hạn. Đang chuyển hướng..."
          : "Không thể tải danh sách việc làm. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);
  const handleCreateJob = async () => {
    try {
      setActionLoading(true);
      console.log("Creating job with form data:", formData);

      const jobRequest: CreateJobRequest = {
        title: formData.title,
        jobType: formData.jobType as any,
        salary: formData.salary,
        openings: formData.openings,
        applicationDeadline: formData.applicationDeadline,
        description: formData.description,
        location: formData.location,
      };

      console.log("Job request payload:", jobRequest);

      const createdJob = await jobsApi.createJob(jobRequest);
      console.log("Job created successfully:", createdJob);

      toast({
        title: "Thành công",
        description: "Tạo việc làm thành công!",
      });
      setIsDialogOpen(false);
      setFormData(initialFormData);

      // Refresh jobs list immediately and again after a delay to ensure backend has processed
      await refreshJobsList();
      // Force a delayed refresh to catch any async backend processing
      setTimeout(async () => {
        console.log("Delayed refresh after job creation...");
        await refreshJobsList(false, true);
      }, 2000);
    } catch (error: any) {
      console.error("Failed to create job:", error);

      const errorMessage = error.message?.includes("Authentication failed")
        ? "Phiên đăng nhập đã hết hạn. Đang chuyển hướng..."
        : error.response?.data?.message ||
          "Không thể tạo việc làm. Vui lòng thử lại.";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    try {
      setActionLoading(true);

      const jobRequest: Partial<CreateJobRequest> = {
        title: formData.title,
        jobType: formData.jobType as any,
        salary: formData.salary,
        openings: formData.openings,
        applicationDeadline: formData.applicationDeadline,
        description: formData.description,
        location: formData.location,
      };

      await jobsApi.updateJob(editingJob.id, jobRequest);
      toast({
        title: "Thành công",
        description: "Cập nhật việc làm thành công!",
      });
      setIsDialogOpen(false);
      setEditingJob(null);
      setFormData(initialFormData);
      await refreshJobsList();
    } catch (error: any) {
      console.error("Failed to update job:", error);

      const errorMessage = error.message?.includes("Authentication failed")
        ? "Phiên đăng nhập đã hết hạn. Đang chuyển hướng..."
        : error.response?.data?.message ||
          "Không thể cập nhật việc làm. Vui lòng thử lại.";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      setActionLoading(true);
      await jobsApi.deleteJob(jobId);
      toast({
        title: "Thành công",
        description: "Xóa việc làm thành công!",
      });

      await refreshJobsList();
    } catch (error: any) {
      console.error("Failed to delete job:", error);

      const errorMessage = error.message?.includes("Authentication failed")
        ? "Phiên đăng nhập đã hết hạn. Đang chuyển hướng..."
        : error.response?.data?.message ||
          "Không thể xóa việc làm. Vui lòng thử lại.";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };
  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      jobType: job.jobType,
      salary: job.salary,
      openings: job.numberOfOpenings,
      applicationDeadline: job.applicationDeadline, // Already in YYYY-MM-DD format from backend
      description: job.description,
      location: job.location,
    });
    setIsDialogOpen(true);
  };
  const formatSalary = (salary: SalaryDto) => {
    const {
      salaryType,
      minSalary,
      maxSalary,
      currency = "USD",
      salaryPeriod = "ANNUAL",
    } = salary;

    if (salaryType === "COMPETITIVE") return "Competitive";
    if (salaryType === "NEGOTIABLE") return "Negotiable";

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (salaryType === "RANGE" && minSalary && maxSalary) {
      return `${formatAmount(minSalary)} - ${formatAmount(
        maxSalary
      )} ${currency} / ${salaryPeriod.toLowerCase()}`;
    }

    if (salaryType === "FIXED" && minSalary) {
      return `${formatAmount(
        minSalary
      )} ${currency} / ${salaryPeriod.toLowerCase()}`;
    }

    return "Not specified";
  };

  const formatJobType = (jobType: string) => {
    return jobType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "CLOSED":
        return "secondary";
      case "EXPIRED":
        return "destructive";
      default:
        return "outline";
    }
  };
  const openJobs = jobs?.filter((job) => job.status === "OPEN") || [];
  const closedJobs = jobs?.filter((job) => job.status === "CLOSED") || [];
  const expiredJobs = jobs?.filter((job) => job.status === "EXPIRED") || [];

  // Debug logging
  console.log("Current jobs state:", jobs);
  console.log("Jobs length:", jobs?.length);
  console.log("Open jobs:", openJobs);
  console.log("Closed jobs:", closedJobs);
  console.log("Expired jobs:", expiredJobs);
  // Handle salary type change with proper min/max salary logic
  const handleSalaryTypeChange = (newSalaryType: string) => {
    console.log(
      "Salary type changing from",
      formData.salary.salaryType,
      "to",
      newSalaryType
    );

    const currentSalary = formData.salary;

    let updatedSalary = {
      ...currentSalary,
      salaryType: newSalaryType as any,
    };

    // Handle transition logic
    if (newSalaryType === "FIXED") {
      // When switching to FIXED, use minSalary for both min and max
      // If minSalary doesn't exist, try to use maxSalary
      const fixedValue = currentSalary.minSalary || currentSalary.maxSalary;
      updatedSalary = {
        ...updatedSalary,
        minSalary: fixedValue,
        maxSalary: fixedValue, // Set both values to be the same
      };
      console.log("Fixed salary - setting both min and max to:", fixedValue);
    } else if (newSalaryType === "RANGE") {
      // When switching to RANGE, keep existing values or set defaults
      if (!currentSalary.minSalary && !currentSalary.maxSalary) {
        // If no values exist, clear both
        updatedSalary = {
          ...updatedSalary,
          minSalary: undefined,
          maxSalary: undefined,
        };
      }
      console.log("Range salary - keeping existing values");
      // If values exist, keep them as is
    } else {
      // For NEGOTIABLE or COMPETITIVE, clear salary values
      updatedSalary = {
        ...updatedSalary,
        minSalary: undefined,
        maxSalary: undefined,
      };
      console.log("Negotiable/Competitive salary - clearing values");
    }

    console.log("Updated salary object:", updatedSalary);

    setFormData({
      ...formData,
      salary: updatedSalary,
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingJob(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
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

  if (error) {
    return (
      <RecruiterLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchJobs}>Thử lại</Button>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {" "}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Việc làm của tôi</h1>
            <p className="text-gray-600">Quản lý các tin đăng tuyển dụng</p>
          </div>{" "}
          <div className="flex gap-2">
            {" "}
            <Button
              variant="outline"
              onClick={() => refreshJobsList(true)}
              disabled={loading}
            >
              {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Làm mới
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Đăng tin mới
                </Button>
              </DialogTrigger>{" "}
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingJob ? "Chỉnh sửa việc làm" : "Đăng tin tuyển dụng"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g. Senior Software Engineer"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobType">Job Type *</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, jobType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g. New York, NY"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="openings">Number of Openings *</Label>
                    <Input
                      id="openings"
                      type="number"
                      min="1"
                      value={formData.openings}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          openings: parseInt(e.target.value) || 1,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="applicationDeadline">
                      Application Deadline *
                    </Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicationDeadline: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Salary Information</Label>

                    <div>
                      <Label htmlFor="salaryType">Salary Type</Label>{" "}
                      <Select
                        value={formData.salary.salaryType}
                        onValueChange={handleSalaryTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {salaryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(formData.salary.salaryType === "FIXED" ||
                      formData.salary.salaryType === "RANGE") && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                              value={formData.salary.currency}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  salary: {
                                    ...formData.salary,
                                    currency: value as any,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="salaryPeriod">Period</Label>
                            <Select
                              value={formData.salary.salaryPeriod}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  salary: {
                                    ...formData.salary,
                                    salaryPeriod: value as any,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {salaryPeriods.map((period) => (
                                  <SelectItem
                                    key={period.value}
                                    value={period.value}
                                  >
                                    {period.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>{" "}
                        {formData.salary.salaryType === "FIXED" && (
                          <div>
                            <Label htmlFor="minSalary">Salary Amount</Label>
                            <Input
                              id="minSalary"
                              type="number"
                              min="0"
                              value={formData.salary.minSalary || ""}
                              onChange={(e) => {
                                const value =
                                  parseFloat(e.target.value) || undefined;
                                setFormData({
                                  ...formData,
                                  salary: {
                                    ...formData.salary,
                                    minSalary: value,
                                    maxSalary: value, // Set both values to be the same for fixed salary
                                  },
                                });
                              }}
                              placeholder="e.g. 80000"
                            />
                          </div>
                        )}
                        {formData.salary.salaryType === "RANGE" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="minSalary">Min Salary</Label>
                              <Input
                                id="minSalary"
                                type="number"
                                min="0"
                                value={formData.salary.minSalary || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    salary: {
                                      ...formData.salary,
                                      minSalary:
                                        parseFloat(e.target.value) || undefined,
                                    },
                                  })
                                }
                                placeholder="e.g. 70000"
                              />
                            </div>
                            <div>
                              <Label htmlFor="maxSalary">Max Salary</Label>
                              <Input
                                id="maxSalary"
                                type="number"
                                min="0"
                                value={formData.salary.maxSalary || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    salary: {
                                      ...formData.salary,
                                      maxSalary:
                                        parseFloat(e.target.value) || undefined,
                                    },
                                  })
                                }
                                placeholder="e.g. 90000"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the job responsibilities, requirements, and qualifications..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingJob ? handleUpdateJob : handleCreateJob}
                      disabled={
                        actionLoading ||
                        !formData.title ||
                        !formData.jobType ||
                        !formData.location ||
                        !formData.description ||
                        !formData.applicationDeadline
                      }
                    >
                      {actionLoading && (
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                      )}
                      {editingJob ? "Update Job" : "Post Job"}
                    </Button>
                  </div>
                </div>{" "}
              </DialogContent>
            </Dialog>
          </div>
        </div>{" "}
        <Tabs defaultValue="open" className="space-y-4">
          <TabsList>
            <TabsTrigger value="open">Đang mở ({openJobs.length})</TabsTrigger>
            <TabsTrigger value="closed">
              Đã đóng ({closedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Hết hạn ({expiredJobs.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="open" className="space-y-4">
            {openJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No open jobs found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {openJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {formatJobType(job.jobType)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(job.salary)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job.numberOfOpenings} opening
                              {job.numberOfOpenings !== 1 ? "s" : ""}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Deadline:{" "}
                              {new Date(
                                job.applicationDeadline
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditJob(job)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{job.title}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 line-clamp-3">
                        {job.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="closed" className="space-y-4">
            {closedJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No closed jobs found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {closedJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {formatJobType(job.jobType)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(job.salary)}
                            </div>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 line-clamp-3">
                        {job.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="expired" className="space-y-4">
            {expiredJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No expired jobs found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {expiredJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {formatJobType(job.jobType)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(job.salary)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Expired:{" "}
                              {new Date(
                                job.applicationDeadline
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 line-clamp-3">
                        {job.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
}
