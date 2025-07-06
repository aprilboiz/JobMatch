"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, FileText, Eye, Clock, CheckCircle, XCircle, Briefcase } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"
import { CVManager } from "@/components/cv-manager"
import { AIJobMatcher } from "@/components/ai-job-matcher"
import { RecruiterDashboard } from "@/components/recruiter-dashboard"
import { RecruiterJobsManager } from "@/components/recruiter-jobs-manager"
import { apiClient } from "@/lib/api"
import { Application } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

function DashboardContent() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      if (user?.role.roleName === "CANDIDATE") {
        const response = await apiClient.getApplications({ page: 0, size: 10 })
        if (response.success) {
          setApplications(response.data.content)
        } else {
          throw new Error(response.message)
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try refreshing the page.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "secondary"
      case "IN_REVIEW":
        return "default"
      case "INTERVIEW":
        return "secondary"
      case "OFFERED":
        return "default"
      case "REJECTED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPLIED":
      case "IN_REVIEW":
        return <Clock className="w-4 h-4" />
      case "INTERVIEW":
        return <Calendar className="w-4 h-4" />
      case "OFFERED":
        return <CheckCircle className="w-4 h-4" />
      case "REJECTED":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
          <p className="text-muted-foreground">
            {user.role.roleName === "CANDIDATE"
              ? "Track your applications and discover new opportunities"
              : "Manage your job postings and review applications"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger className="hover:cursor-pointer" value="overview">Overview</TabsTrigger>
            {user.role.roleName === "CANDIDATE" ? (
              <>
                <TabsTrigger className="hover:cursor-pointer" value="applications">Applications</TabsTrigger>
                <TabsTrigger className="hover:cursor-pointer" value="cv-manager">CV Manager</TabsTrigger>
                <TabsTrigger className="hover:cursor-pointer" value="ai-matcher">AI Matcher</TabsTrigger>
                <TabsTrigger className="hover:cursor-pointer" value="saved-jobs">Saved Jobs</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger className="hover:cursor-pointer" value="jobs">My Jobs</TabsTrigger>
                <TabsTrigger className="hover:cursor-pointer" value="analytics">Analytics</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {user.role.roleName === "CANDIDATE" ? (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Applications</p>
                          <p className="text-2xl font-bold">{applications.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">In Review</p>
                          <p className="text-2xl font-bold">
                            {applications.filter((app) => app.status === "IN_REVIEW").length}
                          </p>
                        </div>
                        <Eye className="w-8 h-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                          <p className="text-2xl font-bold">
                            {applications.filter((app) => app.status === "INTERVIEW").length}
                          </p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Offers</p>
                          <p className="text-2xl font-bold">
                            {applications.filter((app) => app.status === "OFFERED").length}
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No applications yet</p>
                        <p className="text-sm text-muted-foreground">Start applying to jobs to see them here</p>
                        <Button className="mt-4" onClick={() => router.push("/jobs")}>
                          Browse Jobs
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.slice(0, 5).map((application) => (
                          <div
                            key={application.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="font-medium">{application.job.title}</h4>
                                <p className="text-sm text-muted-foreground">{application.job.company.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(application.status)}
                              <Badge variant={getStatusBadgeVariant(application.status)}>
                                {application.status.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <RecruiterDashboard />
            )}
          </TabsContent>

          {user.role.roleName === "CANDIDATE" ? (
            <>
              <TabsContent className="hover:cursor-pointer" value="applications">
                <Card>
                  <CardHeader>
                    <CardTitle>All Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No applications yet</p>
                        <p className="text-sm text-muted-foreground">Start applying to jobs to see them here</p>
                        <Button className="mt-4" onClick={() => router.push("/jobs")}>
                          Browse Jobs
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((application) => (
                          <div
                            key={application.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="font-medium">{application.job.title}</h4>
                                <p className="text-sm text-muted-foreground">{application.job.company.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Applied {new Date(application.appliedDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(application.status)}
                              <Badge variant={getStatusBadgeVariant(application.status)}>
                                {application.status.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent className="hover:cursor-pointer" value="cv-manager">
                <CVManager />
              </TabsContent>
              <TabsContent className="hover:cursor-pointer" value="ai-matcher">
                <AIJobMatcher />
              </TabsContent>
              <TabsContent className="hover:cursor-pointer" value="saved-jobs">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No saved jobs yet</p>
                      <p className="text-sm text-muted-foreground">Save jobs you're interested in to view them here</p>
                      <Button className="mt-4" onClick={() => router.push("/jobs")}>
                        Browse Jobs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent className="hover:cursor-pointer" value="jobs">
                <RecruiterJobsManager />
              </TabsContent>
              <TabsContent className="hover:cursor-pointer" value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Analytics will appear here</p>
                      <p className="text-sm text-muted-foreground">
                        Post jobs and receive applications to see analytics
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardContent />
    </RouteGuard>
  )
}
