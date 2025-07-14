"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, Users, TrendingUp, Eye, MessageSquare, Clock, Download, Plus } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CandidateManager } from "@/components/candidate-manager"
import { Job } from "@/lib/types"
import { t } from '@/lib/i18n-client'

type Dictionary = {
  [key: string]: string;
};

interface RecruiterDashboardProps {
  locale: string;
  dictionary: Dictionary;
}

interface ApplicationSummary {
  id: string
  status: string
  analysis?: {
    score?: number
    matchSkills?: string
    missingSkills?: string
  }
}

interface DashboardJob extends Omit<Job, 'applications'> {
  applications: ApplicationSummary[]
}

interface MockApplication {
  id: string
  candidateId: string
  jobId: string
  status: "APPLIED" | "IN_REVIEW" | "INTERVIEW" | "OFFERED" | "REJECTED"
  appliedDate: string
  cvId: string
  analysis?: {
    score?: number
    matchSkills?: string
    missingSkills?: string
  }
}

export function RecruiterDashboard({ locale, dictionary }: RecruiterDashboardProps) {
  const [jobs, setJobs] = useState<DashboardJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadRecruiterData()
  }, [])

  const loadRecruiterData = async () => {
    try {
      const response = await apiClient.getRecruiterJobs({ page: 0, size: 50 })
      if (response.success) {
        // Load jobs with their applications
        const jobsWithApplications = await Promise.all(
          response.data.content.map(async (job) => {
            try {
              const applicationsResponse = await apiClient.getApplicationsForJob(
                job.id.toString(),
                { page: 0, size: 100 }
              )

              const applications = applicationsResponse.success
                ? applicationsResponse.data.content.map((app: any) => ({
                  id: app.id,
                  status: app.status,
                  aiScore: Math.random() * 100 // TODO: Replace with actual AI score from API
                }))
                : []

              return {
                ...job,
                applications: applications.map(app => ({
                  ...app,
                  analysis: { score: Math.random() * 100 } // TODO: Replace with actual analysis data from API
                }))
              }
            } catch (error) {
              // If we can't get applications, return job with empty applications
              return {
                ...job,
                applications: []
              }
            }
          })
        )

        setJobs(jobsWithApplications)
        if (jobsWithApplications.length > 0) {
          setSelectedJobId(jobsWithApplications[0].id.toString())
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(dictionary, "error.title"),
        description: t(dictionary, "message.loadDashboardError"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default"
      case "CLOSED":
        return "secondary"
      case "EXPIRED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return t(dictionary, "status.open")
      case "CLOSED":
        return t(dictionary, "status.closed")
      case "EXPIRED":
        return t(dictionary, "status.expired")
      default:
        return status
    }
  }

  // Calculate statistics from loaded data
  const stats = {
    activeJobs: jobs.filter(job => job.status === "OPEN").length,
    totalApplications: jobs.reduce((acc, job) => acc + job.applications.length, 0),
    pendingReview: jobs.reduce((acc, job) =>
      acc + job.applications.filter(app => app.status === "APPLIED").length, 0
    ),
    interviews: jobs.reduce((acc, job) =>
      acc + job.applications.filter(app => app.status === "INTERVIEW").length, 0
    ),
    offers: jobs.reduce((acc, job) =>
      acc + job.applications.filter(app => app.status === "OFFERED").length, 0
    ),
    highScoreCandidates: jobs.reduce((acc, job) =>
      acc + job.applications.filter(app => app.analysis?.score && app.analysis.score >= 80).length, 0
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t(dictionary, "stats.activeJobs")}</p>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t(dictionary, "stats.totalApplications")}</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t(dictionary, "stats.pendingReview")}</p>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t(dictionary, "stats.interviews")}</p>
                <p className="text-2xl font-bold">{stats.interviews}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <TabsTrigger value="candidates">{t(dictionary, "stats.candidates")}</TabsTrigger>
          <TabsTrigger value="analytics">{t(dictionary, "dashboard.analytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <div className="space-y-4">
            {/* Job Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {t(dictionary, "dashboard.selectJob")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedJobId === job.id.toString()
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'hover:border-primary/50 hover:shadow-sm'
                        }`}
                      onClick={() => setSelectedJobId(job.id.toString())}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{job.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getStatusBadgeVariant(job.status)} className="text-xs">
                              {getStatusLabel(job.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {job.applications.length} {t(dictionary, "nav.applications").toLowerCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="relative">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {job.applications.length > 0 && (
                              <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center p-0 text-xs"
                              >
                                {job.applications.length > 99 ? "99+" : job.applications.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Candidate Manager */}
            {selectedJobId ? (
              <CandidateManager jobId={selectedJobId} locale={locale} dictionary={dictionary} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">{t(dictionary, "dashboard.selectJobToView")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                {t(dictionary, "dashboard.recruitmentAnalytics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalApplications > 0 ? Math.round((stats.offers / stats.totalApplications) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">{t(dictionary, "dashboard.offerRate")}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalApplications > 0 ? Math.round((stats.interviews / stats.totalApplications) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">{t(dictionary, "dashboard.interviewRate")}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.highScoreCandidates}
                  </div>
                  <div className="text-sm text-muted-foreground">{t(dictionary, "dashboard.highScoreCandidates")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
