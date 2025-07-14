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
import { t } from '@/lib/i18n-client'

type Dictionary = {
  [key: string]: string;
};

interface JobApplicationFormProps {
  job: Job
  locale: string
  dictionary: Dictionary
  onApplicationSubmitted?: () => void
}

export function JobApplicationForm({ job, locale, dictionary, onApplicationSubmitted }: JobApplicationFormProps) {
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
          setSelectedCvId(String(response.data[0].id))
        }
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(dictionary, "error.title"),
        description: t(dictionary, "cv.loadError"),
      })
    }
  }

  const analyzeJobMatch = async () => {
    if (!selectedCvId) return

    setIsAnalyzing(true)
    try {
      const response = await apiClient.getJobMatchScore(String(job.id), selectedCvId)
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
        title: t(dictionary, "application.cvRequired"),
        description: t(dictionary, "application.cvRequiredDesc"),
      })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.createApplication({ jobId: String(job.id), cvId: selectedCvId, coverLetter: coverLetter })

      toast({
        title: t(dictionary, "application.success"),
        description: t(dictionary, "application.successDesc"),
      })

      onApplicationSubmitted?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(dictionary, "application.failed"),
        description: error instanceof Error ? error.message : t(dictionary, "application.failedDesc"),
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

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return t(dictionary, "jobType.fullTime")
      case "PART_TIME":
        return t(dictionary, "jobType.partTime")
      case "CONTRACT":
        return t(dictionary, "jobType.contract")
      case "REMOTE":
        return t(dictionary, "jobType.remote")
      case "INTERNSHIP":
        return t(dictionary, "jobType.internship")
      default:
        return type?.replace("_", " ") || t(dictionary, "common.unknown")
    }
  }

  const generateCoverLetterSuggestion = () => {
    if (!matchScore || !user) return ""

    const suggestions = [
      `${t(dictionary, "application.coverLetterGreeting")},

${t(dictionary, "application.coverLetterIntro")} ${job.title} ${t(dictionary, "application.coverLetterAt")} ${job.company.name}. ${t(dictionary, "application.coverLetterFit")}.

${matchScore.recommendations.length > 0 ? matchScore.recommendations[0] : ""}

${t(dictionary, "application.coverLetterDrawn")} ${job.company.name} ${t(dictionary, "application.coverLetterReason")}.

${t(dictionary, "application.coverLetterThank")}.

${t(dictionary, "application.coverLetterClosing")},
${user.fullName}`,
    ]

    return suggestions[0]
  }

  if (cvs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t(dictionary, "application.applyFor")} {job.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t(dictionary, "application.needCV")}
              <Button variant="link" className="p-0 ml-2 h-auto">
                {t(dictionary, "cv.upload")}
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
            <span>{t(dictionary, "application.applyFor")} {job.title}</span>
            <Badge variant="outline">{job.company.name}</Badge>
          </CardTitle>
          <CardDescription>
            {job.location} • {job.salary?.formattedSalary || t(dictionary, "job.negotiable")} • {getJobTypeLabel(job.jobType)}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* AI Match Analysis */}
      {matchScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              {t(dictionary, "application.aiMatchAnalysis")}
              <Badge variant={getScoreBadgeVariant(matchScore.score)} className="ml-2">
                {matchScore.score}% {t(dictionary, "application.match")}
              </Badge>
            </CardTitle>
            <CardDescription>{t(dictionary, "application.analysisDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{matchScore.score}%</div>
              <div className="text-sm text-muted-foreground">{t(dictionary, "application.overallMatch")}</div>
            </div>

            <Separator />

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">{t(dictionary, "application.skillsMatch")}</div>
                <div className="flex items-center space-x-2">
                  <Progress value={matchScore.breakdown.skillsMatch} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{matchScore.breakdown.skillsMatch}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">{t(dictionary, "application.experienceMatch")}</div>
                <div className="flex items-center space-x-2">
                  <Progress value={matchScore.breakdown.experienceMatch} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{matchScore.breakdown.experienceMatch}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">{t(dictionary, "application.educationMatch")}</div>
                <div className="flex items-center space-x-2">
                  <Progress value={matchScore.breakdown.educationMatch} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{matchScore.breakdown.educationMatch}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">{t(dictionary, "application.locationMatch")}</div>
                <div className="flex items-center space-x-2">
                  <Progress value={matchScore.breakdown.locationMatch} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{matchScore.breakdown.locationMatch}%</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {matchScore.recommendations.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">{t(dictionary, "application.aiRecommendations")}:</div>
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
          <CardTitle>{t(dictionary, "application.details")}</CardTitle>
          <CardDescription>{t(dictionary, "application.complete")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CV Selection */}
            <div className="space-y-2">
              <Label htmlFor="cv-select">{t(dictionary, "application.selectCV")} *</Label>
              <Select value={selectedCvId} onValueChange={setSelectedCvId}>
                <SelectTrigger>
                  <SelectValue placeholder={t(dictionary, "application.chooseCV")} />
                </SelectTrigger>
                <SelectContent>
                  {cvs.map((cv) => (
                    <SelectItem key={cv.id} value={String(cv.id)}>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{cv.fileName}</span>
                        {cv.aiAnalysis && (
                          <Badge variant="outline" className="text-xs">
                            {t(dictionary, "cv.score")}: {cv.aiAnalysis.score}/100
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
                  <span>{t(dictionary, "application.analyzing")}</span>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cover-letter">{t(dictionary, "application.coverLetter")}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverLetter(generateCoverLetterSuggestion())}
                  disabled={!matchScore}
                >
                  <Brain className="w-3 h-3 mr-1" />
                  {t(dictionary, "application.aiSuggestion")}
                </Button>
              </div>
              <Textarea
                id="cover-letter"
                placeholder={t(dictionary, "application.coverLetterPlaceholder")}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground">{coverLetter.length}/2000 {t(dictionary, "common.characters")}</div>
            </div>

            {/* Application Tips */}
            {matchScore && matchScore.score < 70 && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t(dictionary, "application.tip")}:</strong> {t(dictionary, "application.lowMatchTip")} {matchScore.score}%. {t(dictionary, "application.improveTip")}.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button type="submit" disabled={isSubmitting || !selectedCvId} className="flex-1">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    {t(dictionary, "application.submitting")}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t(dictionary, "application.submit")}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline">
                {t(dictionary, "application.saveDraft")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
