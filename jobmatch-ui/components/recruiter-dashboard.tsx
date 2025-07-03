"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Users, TrendingUp, Eye, MessageSquare, Clock, Download } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Application, Job, CandidateRankingItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [candidates, setCandidates] = useState<CandidateRankingItem[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadRecruiterData()
  }, [])

  useEffect(() => {
    if (selectedJobId) {
      loadCandidateRanking()
    }
  }, [selectedJobId])

  const loadRecruiterData = async () => {
    try {
      // Load recruiter's jobs
      const jobsResponse = await apiClient.getJobs({ limit: 50 })
      if (jobsResponse.success) {
        setJobs(jobsResponse.data.content)
        if (jobsResponse.data.content.length > 0) {
          setSelectedJobId(jobsResponse.data.content[0].id)
        }
      } else {
        throw new Error(jobsResponse.message)
      }

      // Load all applications
      const appsResponse = await apiClient.getApplications({ limit: 100 })
      if (appsResponse.success) {
        setApplications(appsResponse.data.content)
      } else {
        throw new Error(appsResponse.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCandidateRanking = async () => {
    if (!selectedJobId) return

    setIsAnalyzing(true)
    try {
      const response = await apiClient.getCandidateRanking(selectedJobId)
      if (response.success) {
        setCandidates(response.data.candidates)
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load candidate rankings",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: Application["status"]) => {
    try {
      await apiClient.updateApplicationStatus(applicationId, status)

      // Update local state
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)))

      // Update candidates if needed
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.application.id === applicationId
            ? { ...candidate, application: { ...candidate.application, status } }
            : candidate,
        ),
      )

      toast({
        variant: "success",
        title: "Status updated",
        description: `Application status changed to ${status.replace("_", " ").toLowerCase()}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update application status",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-700"
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-700"
      case "INTERVIEW":
        return "bg-purple-100 text-purple-700"
      case "OFFERED":
        return "bg-green-100 text-green-700"
      case "REJECTED":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
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
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter((app) => app.status === "IN_REVIEW").length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter((app) => app.status === "INTERVIEW").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ai-ranking" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <TabsTrigger value="ai-ranking">AI Candidate Ranking</TabsTrigger>
          <TabsTrigger value="applications">All Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-ranking" className="space-y-6">
          {/* Job Selection */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI-Powered Candidate Ranking
              </CardTitle>
              <CardDescription>Select a job to see AI-ranked candidates based on CV analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.applicants} applicants)
                    </option>
                  ))}
                </select>
                <Button
                  onClick={loadCandidateRanking}
                  disabled={!selectedJobId || isAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Candidates
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Rankings */}
          {candidates.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Ranked Candidates ({candidates.length})</span>
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    AI Ranked
                  </Badge>
                </CardTitle>
                <CardDescription>Candidates ranked by AI compatibility score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <div
                      key={candidate.candidateId}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={candidate.candidate.profilePicture || "/placeholder.svg"} />
                              <AvatarFallback>
                                {candidate.candidate.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{candidate.candidate.fullName}</h4>
                              <Badge variant={getScoreBadgeVariant(candidate.score)} className="text-xs">
                                {candidate.score}% Match
                              </Badge>
                              <Badge className={getStatusColor(candidate.application.status)}>
                                {candidate.application.status.replace("_", " ")}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{candidate.candidate.email}</p>

                            {/* CV Analysis */}
                            {candidate.cv.aiAnalysis && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-gray-700">CV Score:</span>
                                  <Progress value={candidate.cv.aiAnalysis.score} className="h-1 w-20" />
                                  <span className="text-xs text-gray-600">{candidate.cv.aiAnalysis.score}/100</span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {candidate.cv.aiAnalysis.skills.slice(0, 4).map((skill, skillIndex) => (
                                    <Badge key={skillIndex} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {candidate.cv.aiAnalysis.skills.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{candidate.cv.aiAnalysis.skills.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                              {candidate.score}%
                            </div>
                            <div className="text-xs text-gray-500">AI Match</div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(candidate.cv.fileUrl, "_blank")}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              CV
                            </Button>

                            {candidate.application.status === "APPLIED" && (
                              <Button
                                size="sm"
                                onClick={() => updateApplicationStatus(candidate.application.id, "IN_REVIEW")}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                Review
                              </Button>
                            )}

                            {candidate.application.status === "IN_REVIEW" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateApplicationStatus(candidate.application.id, "INTERVIEW")}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Interview
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateApplicationStatus(candidate.application.id, "REJECTED")}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {candidate.application.status === "INTERVIEW" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateApplicationStatus(candidate.application.id, "OFFERED")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Offer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateApplicationStatus(candidate.application.id, "REJECTED")}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applications">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>Manage all applications across your job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {application.candidate.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-gray-900">{application.candidate.fullName}</h4>
                          <p className="text-sm text-gray-600">Applied for {application.job.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Recruitment Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(
                      (applications.filter((app) => app.status === "OFFERED").length / applications.length) * 100,
                    ) || 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Offer Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(
                      (applications.filter((app) => app.status === "INTERVIEW").length / applications.length) * 100,
                    ) || 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Interview Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {applications.filter((app) => app.aiScore && app.aiScore >= 80).length}
                  </div>
                  <div className="text-sm text-gray-600">High-Score Candidates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
