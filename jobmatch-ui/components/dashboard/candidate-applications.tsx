"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/api"
import { Application } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock, Calendar, CheckCircle, XCircle, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"
import { t } from '@/lib/i18n-client'

type Dictionary = {
    [key: string]: string;
};

interface CandidateApplicationsProps {
    locale: string;
    dictionary: Dictionary;
}

async function fetchApplications() {
    const response = await apiClient.getApplications({ page: 0, size: 10 })
    if (response.success) {
        return response.data.content
    }
    throw new Error(response.message || "Failed to fetch applications")
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

const getStatusLabel = (status: string, dictionary: Dictionary) => {
    switch (status) {
        case "APPLIED":
            return t(dictionary, "status.applied")
        case "IN_REVIEW":
            return t(dictionary, "status.inReview")
        case "INTERVIEW":
            return t(dictionary, "status.interview")
        case "OFFERED":
            return t(dictionary, "status.offered")
        case "REJECTED":
            return t(dictionary, "status.rejected")
        default:
            return status.replace("_", " ")
    }
}

export function CandidateApplications({ locale, dictionary }: CandidateApplicationsProps) {
    const router = useRouter()
    const { data: applications } = useSWR("applications", fetchApplications, {
        suspense: true,
    })

    if (!applications) {
        return null
    }

    return (
        <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t(dictionary, "stats.applications")}</p>
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
                                <p className="text-sm font-medium text-muted-foreground">{t(dictionary, "stats.inReview")}</p>
                                <p className="text-2xl font-bold">
                                    {applications.filter((app) => app.status === "IN_REVIEW").length}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t(dictionary, "stats.interviews")}</p>
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
                                <p className="text-sm font-medium text-muted-foreground">{t(dictionary, "stats.offers")}</p>
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
                    <CardTitle>{t(dictionary, "dashboard.recentApplications")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">{t(dictionary, "dashboard.noApplications")}</p>
                            <p className="text-sm text-muted-foreground">{t(dictionary, "dashboard.startApplying")}</p>
                            <Button className="mt-4" onClick={() => router.push(`/${locale}/jobs`)}>
                                {t(dictionary, "button.browseJobs")}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.slice(0, 5).map((application: Application) => (
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
                                            {getStatusLabel(application.status, dictionary)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
} 