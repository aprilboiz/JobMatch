"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Send, FileText, Brain, AlertCircle, TrendingUp } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Job, CV, JobMatchScore } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface JobApplicationFormProps {
  job: Job
  onApplicationSubmitted?: () => void
}

export function JobApplicationForm({ job, onApplicationSubmitted }: JobApplicationFormProps) {
  const [cvs, setCvs] = useState<CV[]>([])
  const [selectedCvId, setSelectedCvId] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchScore, setMatchScore] = useState<JobMatchScore | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadCVs()
  }, [])

  useEffect(() => {
    if (selectedCvId) {
      analyzeJobMatch()
    }
  }, [selectedCvId])

  const loadCVs = async () => {
    try {
      const response = await apiClient.getCVs()
      if (response.success) {
        setCvs(response.data)
        if (response.data.length > 0) {
          setSelectedCvId(response.data[0].id)
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
    }
  }

  const analyzeJobMatch = async () => {
    if (!selectedCvId) return

    setIsAnalyzing(true)
    try {
      const response = await apiClient.getJobMatchScore(job.id, selectedCvId)
      if (response.success) {
        setMatchScore(response.data)
      } else {
        console.warn("Failed to analyze job match:", response.message)
      }
    } catch (error) {
      console.warn("Failed to analyze job match:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCvId) {
      toast({
        variant: "destructive",
        title: "CV Required",
        description: "Please select a CV to submit with your application",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.applyToJob(job.id, selectedCvId, coverLetter)

      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer",
      })

      onApplicationSubmitted?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Application failed",
        description: error instanceof Error ? error.message : "Failed to submit application",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const generateCoverLetterSuggestion = () => {
    if (!matchScore || !user) return ""

    const suggestions = [
      `Dear Hiring Manager,

I am excited to apply for the ${job.title} position at ${job.company.name}. Based on my background and experience, I believe I would be an excellent fit for this role.

${matchScore.recommendations.length > 0 ? matchScore.recommendations[0] : ""}

I am particularly drawn to this opportunity because of ${job.company.name}'s reputation in the industry and the chance to contribute to your team's success.

Thank you for considering my application. I look forward to discussing how my skills and experience can benefit your organization.

Best regards,
${user.fullName}`,
    ]

    return suggestions[0]
  }

  if (cvs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Apply for {job.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to upload at least one CV before applying for jobs.
              <Button variant="link" className="p-0 ml-2 h-auto">
                Upload CV
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Job Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Apply for {job.title}</span>
            <Badge variant="outline">{job.company.name}</Badge>
          </CardTitle>
          <CardDescription>
            {job.location} • {job.salary} • {job.type.replace("_", " ")}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* AI Match Analysis */}
      {matchScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              AI Match Analysis
              <Badge variant={getScoreBadgeVariant(matchScore.score)} className="ml-2">
                {matchScore.score}% Match
              </Badge>
            </CardTitle>
            <CardDescription>Analysis of how well your CV matches this job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{matchScore.score}%</div>
              <div className="text-sm text-muted-foreground">Overall Match Score</div>
            </div>

            <Separator />

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Skills Match</div>
                <div className="flex items-center space-x-2">
                  <Progress value={matchScore.breakdown.skillsMatch} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{matchScore.breakdown.skillsMatch}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Experience Match</div>
                <div className="flex items-center space-x-2">
                  <Progress value={matchScore.breakdown.experienceMatch} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{matchScore.breakdown.experienceMatch}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Education Match</div>
                <div className="flex items-center space-x-2">
                  <Progress value={matchScore.breakdown.educationMatch} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{matchScore.breakdown.educationMatch}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Location Match</div>
                <div className="flex items-center space-x-2">
                  <Progress value={matchScore.breakdown.locationMatch} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{matchScore.breakdown.locationMatch}%</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {matchScore.recommendations.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">AI Recommendations:</div>
                <div className="space-y-2">
                  {matchScore.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>Complete your application for this position</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CV Selection */}
            <div className="space-y-2">
              <Label htmlFor="cv-select">Select CV *</Label>
              <Select value={selectedCvId} onValueChange={setSelectedCvId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a CV to submit" />
                </SelectTrigger>
                <SelectContent>
                  {cvs.map((cv) => (
                    <SelectItem key={cv.id} value={cv.id}>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{cv.fileName}</span>
                        {cv.aiAnalysis && (
                          <Badge variant="outline" className="text-xs">
                            Score: {cv.aiAnalysis.score}/100
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isAnalyzing && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  <span>Analyzing job match...</span>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cover-letter">Cover Letter</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverLetter(generateCoverLetterSuggestion())}
                  disabled={!matchScore}
                >
                  <Brain className="w-3 h-3 mr-1" />
                  AI Suggestion
                </Button>
              </div>
              <Textarea
                id="cover-letter"
                placeholder="Write a compelling cover letter to introduce yourself..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground">{coverLetter.length}/2000 characters</div>
            </div>

            {/* Application Tips */}
            {matchScore && matchScore.score < 70 && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Your match score is {matchScore.score}%. Consider highlighting relevant skills
                  in your cover letter to improve your chances.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button type="submit" disabled={isSubmitting || !selectedCvId} className="flex-1">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
              <Button type="button" variant="outline">
                Save Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
