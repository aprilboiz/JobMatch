"use client"

import { useState, useEffect, Suspense } from "react"
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
import { JobMatchResults, JobMatchResultsSkeleton } from "@/components/ai/job-match-results"

interface AIJobMatcherProps {
  selectedCvId?: string
}

export function AIJobMatcher({ selectedCvId }: AIJobMatcherProps) {
  const [cvs, setCvs] = useState<CV[]>([])
  const [selectedCV, setSelectedCV] = useState<string>(selectedCvId || "")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadCVs()
  }, [])

  const loadCVs = async () => {
    try {
      const response = await apiClient.getCVs()
      if (response.success) {
        const cvs = response.data.filter((cv) => cv.aiAnalysis) // Only show analyzed CVs
        setCvs(cvs)
        if (cvs.length > 0 && !selectedCvId) {
          setSelectedCV(String(cvs[0].id))
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
                  <SelectItem key={cv.id} value={String(cv.id)}>
                    {cv.fileName} (Score: {cv.aiAnalysis?.score}/100)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Match Results */}
      {selectedCV && (
        <Suspense fallback={<JobMatchResultsSkeleton />}>
          <JobMatchResults cvId={selectedCV} />
        </Suspense>
      )}
    </div>
  )
}
