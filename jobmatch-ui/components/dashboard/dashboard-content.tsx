"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, FileText, Eye, Clock, CheckCircle, XCircle, Briefcase } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Application } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { CandidateApplications } from "@/components/dashboard/candidate-applications"
import { t } from '@/lib/i18n-client'
import dynamic from "next/dynamic"

const CVManager = dynamic(() => import("@/components/cv/cv-manager").then((mod) => mod.CVManager), {
    ssr: false,
})
const AIJobMatcher = dynamic(() => import("@/components/ai-job-matcher").then((mod) => mod.AIJobMatcher), {
    ssr: false,
})
const RecruiterDashboard = dynamic(() => import("@/components/dashboard/recruiter-dashboard").then((mod) => mod.RecruiterDashboard), {
    ssr: false,
})
const RecruiterJobsManager = dynamic(() => import("@/components/recruiter-jobs-manager").then((mod) => mod.RecruiterJobsManager), {
    ssr: false,
})

type Dictionary = {
    [key: string]: string;
};

interface DashboardContentProps {
    locale: string;
    dictionary: Dictionary;
}

function CandidateDashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-8 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-1/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function DashboardContent({ locale, dictionary }: DashboardContentProps) {
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
                title: t(dictionary, "error.title"),
                description: t(dictionary, "message.loadDashboardError"),
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
                    <h1 className="text-3xl font-bold mb-2">{t(dictionary, "dashboard.welcome")}, {user.fullName}!</h1>
                    <p className="text-muted-foreground">
                        {user.role.roleName === "CANDIDATE"
                            ? t(dictionary, "dashboard.candidateSubtitle")
                            : t(dictionary, "dashboard.recruiterSubtitle")}
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
                        <TabsTrigger value="overview">{t(dictionary, "dashboard.overview")}</TabsTrigger>
                        {user.role.roleName === "CANDIDATE" ? (
                            <>
                                <TabsTrigger value="applications">{t(dictionary, "dashboard.applications")}</TabsTrigger>
                                <TabsTrigger value="cv-manager">{t(dictionary, "dashboard.cvManager")}</TabsTrigger>
                                <TabsTrigger value="ai-matcher">{t(dictionary, "dashboard.aiMatcher")}</TabsTrigger>
                                <TabsTrigger value="saved-jobs">{t(dictionary, "dashboard.savedJobs")}</TabsTrigger>
                            </>
                        ) : (
                            <>
                                <TabsTrigger value="jobs">{t(dictionary, "dashboard.myJobs")}</TabsTrigger>
                                <TabsTrigger value="analytics">{t(dictionary, "dashboard.analytics")}</TabsTrigger>
                            </>
                        )}
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {user.role.roleName === "CANDIDATE" ? (
                            <Suspense fallback={<CandidateDashboardSkeleton />}>
                                <CandidateApplications locale={locale} dictionary={dictionary} />
                            </Suspense>
                        ) : (
                            <RecruiterDashboard locale={locale} dictionary={dictionary} />
                        )}
                    </TabsContent>

                    {user.role.roleName === "CANDIDATE" && (
                        <>
                            <TabsContent value="applications">
                                <Suspense fallback={<CandidateDashboardSkeleton />}>
                                    <CandidateApplications locale={locale} dictionary={dictionary} />
                                </Suspense>
                            </TabsContent>
                            <TabsContent value="cv-manager">
                                <CVManager locale={locale} dictionary={dictionary} />
                            </TabsContent>
                            <TabsContent value="ai-matcher">
                                <AIJobMatcher />
                            </TabsContent>
                            <TabsContent value="saved-jobs">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t(dictionary, "dashboard.savedJobs")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">{t(dictionary, "dashboard.noSavedJobs")}</p>
                                            <p className="text-sm text-muted-foreground">Save jobs you're interested in to view them here</p>
                                            <Button className="mt-4" onClick={() => router.push(`/${locale}/jobs`)}>
                                                {t(dictionary, "button.browseJobs")}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </>
                    )}

                    {user.role.roleName === "RECRUITER" && (
                        <>
                            <TabsContent value="jobs">
                                <RecruiterJobsManager />
                            </TabsContent>
                            <TabsContent value="analytics">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t(dictionary, "dashboard.analytics")}</CardTitle>
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