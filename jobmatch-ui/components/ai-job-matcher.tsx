"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Brain, Target, TrendingUp, MapPin, Building2, DollarSign, Clock, AlertTriangle, Zap } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Job, CV, JobMatch } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface AIJobMatcherProps {
  selectedCvId?: string
}

export function AIJobMatcher({ selectedCvId }: AIJobMatcherProps) {
  const [cvs, setCvs] = useState<CV[]>([])
  const [selectedCV, setSelectedCV] = useState<string>(selectedCvId || "")
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadCVs()
  }, [])

  useEffect(() => {
    if (selectedCV && cvs.length > 0) {
      analyzeJobMatches()
    }
  }, [selectedCV])

  const loadCVs = async () => {
    try {
      const response = await apiClient.getCVs()
      if (response.success) {
        const cvs = response.data.filter((cv) => cv.aiAnalysis) // Only show analyzed CVs
        setCvs(cvs)
        if (cvs.length > 0 && !selectedCvId) {
          setSelectedCV(cvs[0].id)
        }
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load CVs",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeJobMatches = async () => {
    if (!selectedCV) return

    setIsAnalyzing(true)
    try {
      // Get available jobs
      const jobsResponse = await apiClient.getJobs({ limit: 20 })
      if (!jobsResponse.success) {
        throw new Error(jobsResponse.message)
      }

      // Analyze each job for compatibility
      const matches: JobMatch[] = []

      for (const job of jobsResponse.data.content) {
        try {
          const response = await apiClient.getJobMatchScore(job.id, selectedCV)
          if (response.success) {
            matches.push({
              job,
              score: response.data.score,
              breakdown: response.data.breakdown,
              recommendations: response.data.recommendations,
            })
          }
        } catch (error) {
          // Skip jobs that can't be analyzed
          console.warn(`Failed to analyze job ${job.id}:`, error)
        }
      }

      // Sort by score descending
      matches.sort((a, b) => b.score - a.score)
      setJobMatches(matches)

      toast({
        title: "Analysis complete",
        description: `Found ${matches.length} job matches for your CV`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Failed to analyze job matches",
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

  const getMatchLevel = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Poor Match"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cvs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI Job Matcher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need to upload and analyze at least one CV to use the AI job matcher.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* CV Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI Job Matcher
          </CardTitle>
          <CardDescription>Find jobs that match your skills and experience using AI analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select CV for Analysis</Label>
            <Select value={selectedCV} onValueChange={setSelectedCV}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a CV to analyze" />
              </SelectTrigger>
              <SelectContent>
                {cvs.map((cv) => (
                  <SelectItem key={cv.id} value={cv.id}>
                    {cv.fileName} (Score: {cv.aiAnalysis?.score}/100)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={analyzeJobMatches} disabled={isAnalyzing || !selectedCV} className="w-full">
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Analyzing Job Matches...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analyze Job Matches
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Job Matches */}
      {jobMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Job Matches ({jobMatches.length})
              </span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                AI Powered
              </Badge>
            </CardTitle>
            <CardDescription>Jobs ranked by compatibility with your CV</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {jobMatches.slice(0, 10).map((match, index) => (
                <Card key={match.job.id} className="hover:shadow-md transition-shadow hover:cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{match.job.title}</h3>
                          <Badge variant={getScoreBadgeVariant(match.score)} className="text-xs">
                            {match.score}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {match.job.company.name}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {match.job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {match.job.salary}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{match.job.description}</p>
                      </div>
                      <div className="ml-4 text-center">
                        <div className="text-2xl font-bold text-primary">{match.score}%</div>
                        <div className="text-xs text-muted-foreground">{getMatchLevel(match.score)}</div>
                      </div>
                    </div>

                    {/* Match Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs font-medium mb-1">Skills</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={match.breakdown.skillsMatch} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">{match.breakdown.skillsMatch}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-1">Experience</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={match.breakdown.experienceMatch} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">{match.breakdown.experienceMatch}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-1">Education</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={match.breakdown.educationMatch} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">{match.breakdown.educationMatch}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-1">Location</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={match.breakdown.locationMatch} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">{match.breakdown.locationMatch}%</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    {match.recommendations.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-medium mb-2">AI Recommendations:</div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">{match.recommendations[0]}</p>
                        </div>
                      </div>
                    )}

                    <Separator className="mb-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {match.job.type.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {match.job.postedDate}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm">Apply Now</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Statistics */}
      {jobMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Match Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {jobMatches.filter((m) => m.score >= 80).length}
                </div>
                <div className="text-sm text-muted-foreground">Excellent Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {jobMatches.filter((m) => m.score >= 60 && m.score < 80).length}
                </div>
                <div className="text-sm text-muted-foreground">Good Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(jobMatches.reduce((acc, m) => acc + m.score, 0) / jobMatches.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Average Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.max(...jobMatches.map((m) => m.score))}%</div>
                <div className="text-sm text-muted-foreground">Best Match</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
