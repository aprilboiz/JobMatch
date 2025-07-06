"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Brain, Download, Eye, Star, FileText, Award, Zap, BarChart3, Filter, RefreshCw } from "lucide-react"
import { apiClient, type Application, type Job } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface CVScore {
    candidateId: string
    candidate: {
        id: string
        fullName: string
        email: string
        profilePicture?: string
    }
    cv: {
        id: string
        fileName: string
        fileUrl: string
        aiAnalysis?: {
            score: number
            skills: string[]
            experience: string
            education: string
            recommendations: string[]
        }
    }
    jobMatchScore?: {
        score: number
        breakdown: {
            skillsMatch: number
            experienceMatch: number
            educationMatch: number
            locationMatch: number
        }
        recommendations: string[]
    }
    application?: Application
}

interface AICVScorerProps {
    jobId?: string
}

export function AICVScorer({ jobId }: AICVScorerProps) {
    const [jobs, setJobs] = useState<Job[]>([])
    const [selectedJobId, setSelectedJobId] = useState<string>(jobId || "")
    const [cvScores, setCvScores] = useState<CVScore[]>([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [sortBy, setSortBy] = useState<"score" | "skills" | "experience" | "education">("score")
    const [filterBy, setFilterBy] = useState<"all" | "high" | "medium" | "low">("all")
    const { toast } = useToast()

    useEffect(() => {
        loadJobs()
    }, [])

    useEffect(() => {
        if (selectedJobId) {
            analyzeCVs()
        }
    }, [selectedJobId])

    const loadJobs = async () => {
        try {
            const { jobs: jobsData } = await apiClient.getJobs({ limit: 50 })
            setJobs(jobsData)
            if (jobsData.length > 0 && !selectedJobId) {
                setSelectedJobId(jobsData[0].id)
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load jobs",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const analyzeCVs = async () => {
        if (!selectedJobId) return

        setIsAnalyzing(true)
        try {
            // Get applications for the selected job
            const { applications } = await apiClient.getApplications({ jobId: selectedJobId, limit: 100 })

            const scores: CVScore[] = []

            for (const application of applications) {
                try {
                    // Get job match score for each candidate
                    const matchScore = await apiClient.getJobMatchScore(selectedJobId, application.cvId)

                    scores.push({
                        candidateId: application.candidateId,
                        candidate: application.candidate,
                        cv: {
                            id: application.cvId,
                            fileName: `${application.candidate.fullName}_CV.pdf`,
                            fileUrl: "#", // This would come from the CV data
                            aiAnalysis: {
                                score: matchScore.score,
                                skills: [], // This would come from CV analysis
                                experience: "5+ years", // This would come from CV analysis
                                education: "Bachelor's Degree", // This would come from CV analysis
                                recommendations: matchScore.recommendations,
                            },
                        },
                        jobMatchScore: matchScore,
                        application,
                    })
                } catch (error) {
                    console.warn(`Failed to analyze CV for candidate ${application.candidateId}:`, error)
                }
            }

            // Sort by selected criteria
            scores.sort((a, b) => {
                switch (sortBy) {
                    case "score":
                        return (b.jobMatchScore?.score || 0) - (a.jobMatchScore?.score || 0)
                    case "skills":
                        return (b.jobMatchScore?.breakdown.skillsMatch || 0) - (a.jobMatchScore?.breakdown.skillsMatch || 0)
                    case "experience":
                        return (b.jobMatchScore?.breakdown.experienceMatch || 0) - (a.jobMatchScore?.breakdown.experienceMatch || 0)
                    case "education":
                        return (b.jobMatchScore?.breakdown.educationMatch || 0) - (a.jobMatchScore?.breakdown.educationMatch || 0)
                    default:
                        return 0
                }
            })

            setCvScores(scores)

            toast({
                title: "Analysis complete",
                description: `Analyzed ${scores.length} CVs for job matching`,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Analysis failed",
                description: "Failed to analyze CVs",
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const getScoreBadgeVariant = (score: number) => {
        if (score >= 80) return "default"
        if (score >= 60) return "secondary"
        return "destructive"
    }

    const getScoreCategory = (score: number) => {
        if (score >= 80) return "high"
        if (score >= 60) return "medium"
        return "low"
    }

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent Match"
        if (score >= 60) return "Good Match"
        if (score >= 40) return "Fair Match"
        return "Poor Match"
    }

    const filteredScores = cvScores.filter((score) => {
        if (filterBy === "all") return true
        const category = getScoreCategory(score.jobMatchScore?.score || 0)
        return category === filterBy
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-32 bg-muted rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-600" />
                        AI CV Scorer
                    </CardTitle>
                    <CardDescription>Analyze and score candidate CVs using AI-powered matching algorithms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Label>Select Job Position</Label>
                            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a job to analyze CVs for" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobs.map((job) => (
                                        <SelectItem key={job.id} value={job.id}>
                                            {job.title} - {job.company.name} ({job.applicants} applicants)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={analyzeCVs}
                                disabled={isAnalyzing || !selectedJobId}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Analyze CVs
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Analytics Overview */}
            {cvScores.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total CVs</p>
                                    <p className="text-2xl font-bold">{cvScores.length}</p>
                                </div>
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Excellent Matches</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {cvScores.filter((s) => (s.jobMatchScore?.score || 0) >= 80).length}
                                    </p>
                                </div>
                                <Star className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Good Matches</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {
                                            cvScores.filter((s) => {
                                                const score = s.jobMatchScore?.score || 0
                                                return score >= 60 && score < 80
                                            }).length
                                        }
                                    </p>
                                </div>
                                <Award className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {Math.round(cvScores.reduce((acc, s) => acc + (s.jobMatchScore?.score || 0), 0) / cvScores.length)}%
                                    </p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters and Controls */}
            {cvScores.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label>Sort by</Label>
                                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="score">Overall Score</SelectItem>
                                        <SelectItem value="skills">Skills Match</SelectItem>
                                        <SelectItem value="experience">Experience Match</SelectItem>
                                        <SelectItem value="education">Education Match</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label>Filter by Score</Label>
                                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Candidates</SelectItem>
                                        <SelectItem value="high">Excellent (80%+)</SelectItem>
                                        <SelectItem value="medium">Good (60-79%)</SelectItem>
                                        <SelectItem value="low">Fair (Below 60%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* CV Scores List */}
            {filteredScores.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>CV Analysis Results ({filteredScores.length})</span>
                            <Badge variant="outline" className="text-purple-600 border-purple-600">
                                AI Powered
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {filteredScores.map((score, index) => (
                                <Card key={score.candidateId} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="relative">
                                                    <Avatar className="w-12 h-12">
                                                        <AvatarImage src={score.candidate.profilePicture || "/placeholder.svg"} />
                                                        <AvatarFallback>
                                                            {score.candidate.fullName
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h4 className="font-semibold text-gray-900">{score.candidate.fullName}</h4>
                                                        <Badge variant={getScoreBadgeVariant(score.jobMatchScore?.score || 0)}>
                                                            {score.jobMatchScore?.score || 0}% Match
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground mb-3">{score.candidate.email}</p>

                                                    {/* Score Breakdown */}
                                                    {score.jobMatchScore && (
                                                        <div className="space-y-2 mb-4">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground mb-1">Skills</div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Progress
                                                                            value={score.jobMatchScore.breakdown.skillsMatch}
                                                                            className="h-1 flex-1"
                                                                        />
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {score.jobMatchScore.breakdown.skillsMatch}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground mb-1">Experience</div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Progress
                                                                            value={score.jobMatchScore.breakdown.experienceMatch}
                                                                            className="h-1 flex-1"
                                                                        />
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {score.jobMatchScore.breakdown.experienceMatch}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground mb-1">Education</div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Progress
                                                                            value={score.jobMatchScore.breakdown.educationMatch}
                                                                            className="h-1 flex-1"
                                                                        />
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {score.jobMatchScore.breakdown.educationMatch}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-medium text-muted-foreground mb-1">Location</div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Progress
                                                                            value={score.jobMatchScore.breakdown.locationMatch}
                                                                            className="h-1 flex-1"
                                                                        />
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {score.jobMatchScore.breakdown.locationMatch}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* AI Recommendations */}
                                                            {score.jobMatchScore.recommendations.length > 0 && (
                                                                <div className="mt-3">
                                                                    <div className="text-xs font-medium text-muted-foreground mb-1">AI Insights:</div>
                                                                    <div className="bg-muted rounded-lg p-3">
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {score.jobMatchScore.recommendations[0]}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end space-y-2 ml-4">
                                                <div className="text-right">
                                                    <div
                                                        className={`text-2xl font-bold ${(score.jobMatchScore?.score || 0) >= 80
                                                                ? "text-green-600"
                                                                : (score.jobMatchScore?.score || 0) >= 60
                                                                    ? "text-yellow-600"
                                                                    : "text-red-600"
                                                            }`}
                                                    >
                                                        {score.jobMatchScore?.score || 0}%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {getScoreLabel(score.jobMatchScore?.score || 0)}
                                                    </div>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline" onClick={() => window.open(score.cv.fileUrl, "_blank")}>
                                                        <Download className="w-3 h-3 mr-1" />
                                                        CV
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        Profile
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : cvScores.length > 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No CVs match the current filter criteria</p>
                        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setFilterBy("all")}>
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-6 text-center">
                        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No CV analysis available</p>
                        <p className="text-sm text-muted-foreground">
                            Select a job position and click "Analyze CVs" to get started
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
