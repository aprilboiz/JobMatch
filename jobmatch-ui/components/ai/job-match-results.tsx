"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/api"
import { Job, JobMatch } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Target, TrendingUp, MapPin, Building2, DollarSign, Clock, AlertTriangle } from "lucide-react"

async function fetchJobMatches(cvId: string) {
    const jobsResponse = await apiClient.getJobs()
    if (!jobsResponse.success) {
        throw new Error(jobsResponse.message)
    }

    const matches: JobMatch[] = []
    for (const job of jobsResponse.data.content) {
        try {
            const response = await apiClient.getJobMatchScore(String(job.id), cvId)
            if (response.success) {
                matches.push({
                    job,
                    score: response.data.score,
                    breakdown: response.data.breakdown,
                    recommendations: response.data.recommendations,
                })
            }
        } catch (error) {
            console.warn(`Failed to analyze job ${job.id}:`, error)
        }
    }
    matches.sort((a, b) => b.score - a.score)
    return matches
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

export function JobMatchResults({ cvId }: { cvId: string }) {
    const { data: jobMatches } = useSWR(["job-matches", cvId], () => fetchJobMatches(cvId), {
        suspense: true,
    })

    if (!jobMatches) {
        return null
    }

    if (jobMatches.length === 0) {
        return (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Could not find any job matches for the selected CV.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Top Job Matches</h3>
            {jobMatches.map(({ job, score, breakdown, recommendations }) => (
                <Card key={job.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{job.title}</CardTitle>
                                <CardDescription>
                                    {job.company.name} - {job.location}
                                </CardDescription>
                            </div>
                            <Badge variant={getScoreBadgeVariant(score)} className="text-lg">
                                {score}%
                            </Badge>
                        </div>
                        <p className="text-sm font-semibold">{getMatchLevel(score)}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <Progress value={score} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                                <h4 className="font-semibold mb-2">Match Breakdown</h4>
                                <ul className="space-y-1">
                                    {Object.entries(breakdown).map(([skill, score]) => (
                                        <li key={skill} className="flex justify-between">
                                            <span>{skill}</span>
                                            <span className="font-bold">{score}%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">AI Recommendations</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {job.jobType}
                            </div>
                            <div className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {job.salary.minSalary} - {job.salary.maxSalary}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function JobMatchResultsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 