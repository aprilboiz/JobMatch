"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    MapPin,
    Building2,
    DollarSign,
    Clock,
    Users,
    Share2,
    Heart,
    ArrowLeft,
    Briefcase,
    Globe,
    Mail,
    Phone,
    CheckCircle,
    AlertCircle,
    Edit,
    Trash2,
    Eye,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { JobApplicationForm } from "@/components/job-application-form"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { apiClient } from "@/lib/api"
import { Job } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { t } from '@/lib/i18n-client'

type Dictionary = {
    [key: string]: string;
};

interface JobDetailContentProps {
    locale: string;
    dictionary: Dictionary;
    jobId: string;
}

// Component for recruiter-specific actions
function RecruiterJobActions({ job, onJobDeleted, locale, dictionary }: { job: Job; onJobDeleted: () => void; locale: string; dictionary: Dictionary }) {
    const router = useRouter()
    const { toast } = useToast()
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        isDeleting: false
    })

    const handleDeleteConfirm = async () => {
        setDeleteModal(prev => ({ ...prev, isDeleting: true }))

        try {
            await apiClient.deleteJob(job.id.toString())
            toast({
                title: t(dictionary, "success.title"),
                description: t(dictionary, "job.deleteSuccess"),
            })
            onJobDeleted()
        } catch (error) {
            toast({
                variant: "destructive",
                title: t(dictionary, "error.title"),
                description: t(dictionary, "job.deleteError"),
            })
        } finally {
            setDeleteModal({ isOpen: false, isDeleting: false })
        }
    }

    return (
        <>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        {t(dictionary, "job.management")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <Button
                            onClick={() => router.push(`/${locale}/jobs/edit/${job.id}`)}
                            className="w-full"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            {t(dictionary, "job.editJob")}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/${locale}/dashboard`)}
                            className="w-full"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            {t(dictionary, "job.viewApplications")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteModal({ isOpen: true, isDeleting: false })}
                            className="w-full"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t(dictionary, "job.deleteJob")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, isDeleting: false })}
                onConfirm={handleDeleteConfirm}
                title={t(dictionary, "job.deleteConfirm")}
                description={t(dictionary, "job.deleteWarning")}
                isLoading={deleteModal.isDeleting}
            />
        </>
    )
}

// Component for candidate-specific actions
function CandidateJobActions({ job, locale, dictionary }: { job: Job; locale: string; dictionary: Dictionary }) {
    const { toast } = useToast()
    const [showApplicationForm, setShowApplicationForm] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const handleSaveJob = () => {
        setIsSaved(!isSaved)
        toast({
            title: isSaved ? t(dictionary, "job.jobRemoved") : t(dictionary, "job.jobSaved"),
            description: isSaved ? t(dictionary, "job.jobRemovedDesc") : t(dictionary, "job.jobSavedDesc"),
        })
    }

    return (
        <>
            {!showApplicationForm && (
                <div className="flex space-x-4">
                    <Button
                        size="lg"
                        className="flex-1"
                        onClick={() => setShowApplicationForm(true)}
                    >
                        {t(dictionary, "job.applyNow")}
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleSaveJob}
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-current text-red-500" : ""}`} />
                    </Button>
                </div>
            )}

            {showApplicationForm && (
                <JobApplicationForm
                    job={job}
                    locale={locale}
                    dictionary={dictionary}
                    onApplicationSubmitted={() => {
                        setShowApplicationForm(false)
                        toast({
                            title: t(dictionary, "application.success"),
                            description: t(dictionary, "application.successDesc"),
                        })
                    }}
                />
            )}
        </>
    )
}

// Component for guest/unauthenticated users
function GuestJobActions({ locale, dictionary }: { locale: string; dictionary: Dictionary }) {
    const router = useRouter()

    return (
        <Button size="lg" className="w-full" onClick={() => router.push(`/${locale}/login`)}>
            {t(dictionary, "button.signInToApply")}
        </Button>
    )
}

export default function JobDetailContent({ locale, dictionary, jobId }: JobDetailContentProps) {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const { toast } = useToast()
    const [job, setJob] = useState<Job | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (jobId) {
            loadJobDetails(jobId)
        }
    }, [jobId])

    const loadJobDetails = async (jobId: string) => {
        try {
            const jobData = await apiClient.getJob(jobId)
            setJob(jobData.data)
        } catch (error) {
            toast({
                variant: "destructive",
                title: t(dictionary, "error.title"),
                description: t(dictionary, "job.loadError"),
            })
            router.push(`/${locale}/jobs`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleJobDeleted = () => {
        router.push(`/${locale}/dashboard`)
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: job?.title,
                    text: `Check out this job opportunity: ${job?.title} at ${job?.company.name}`,
                    url: window.location.href,
                })
            } catch (error) {
                // User cancelled sharing
            }
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href)
            toast({
                title: t(dictionary, "job.shareSuccess"),
                description: t(dictionary, "job.shareSuccess"),
            })
        }
    }

    const getJobTypeVariant = (type: string) => {
        switch (type) {
            case "FULL_TIME":
                return "default"
            case "PART_TIME":
                return "secondary"
            case "CONTRACT":
                return "outline"
            case "REMOTE":
                return "secondary"
            case "INTERNSHIP":
                return "outline"
            default:
                return "secondary"
        }
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
                return type?.replace("_", " ") || "Unknown"
        }
    }

    // Check if current user is the recruiter who posted this job
    const isJobOwner = user?.role.roleName === "RECRUITER" && job?.recruiterId === user?.id.toString()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
                <div className="container py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-muted rounded w-1/4"></div>
                        <div className="h-64 bg-muted rounded"></div>
                        <div className="h-32 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="p-6">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">{t(dictionary, "job.notFound")}</h2>
                        <p className="text-muted-foreground mb-4">{t(dictionary, "job.loadError")}</p>
                        <Button asChild>
                            <Link href={`/${locale}/jobs`}>{t(dictionary, "button.browseJobs")}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
            <div className="container py-8">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-6">
                    <Link href={`/${locale}/jobs`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t(dictionary, "button.goBack")}
                    </Link>
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header */}
                        <Card className="shadow-lg">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-start space-x-4">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src={job.company.logoUrl || "/placeholder.svg"} alt={job.company.name} />
                                            <AvatarFallback>
                                                <Building2 className="w-8 h-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Building2 className="w-5 h-5 text-muted-foreground" />
                                                <span className="text-lg font-medium">{job.company.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-muted-foreground">
                                                <span className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    {job.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={handleShare}>
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mb-6">
                                    <Badge variant={getJobTypeVariant(job.jobType)} className="text-sm">
                                        {getJobTypeLabel(job.jobType)}
                                    </Badge>
                                    <Badge variant="outline" className="text-sm">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        {job.salary?.formattedSalary || "Negotiable"}
                                    </Badge>
                                    <Badge variant="outline" className="text-sm">
                                        {job.status}
                                    </Badge>
                                </div>

                                {/* Role-based Action Section */}
                                {isJobOwner ? (
                                    <Alert className="mb-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {t(dictionary, "job.recruiterOnly")}
                                        </AlertDescription>
                                    </Alert>
                                ) : isAuthenticated ? (
                                    user?.role.roleName === "CANDIDATE" ? (
                                        <CandidateJobActions job={job} locale={locale} dictionary={dictionary} />
                                    ) : (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {t(dictionary, "job.candidateOnly")}
                                            </AlertDescription>
                                        </Alert>
                                    )
                                ) : (
                                    <GuestJobActions locale={locale} dictionary={dictionary} />
                                )}
                            </CardContent>
                        </Card>

                        {/* Job Details Tabs */}
                        <Card className="shadow-lg">
                            <Tabs defaultValue="description" className="w-full">
                                <CardHeader>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="description">{t(dictionary, "job.description")}</TabsTrigger>
                                        <TabsTrigger value="requirements">{t(dictionary, "job.requirements")}</TabsTrigger>
                                        <TabsTrigger value="company">{t(dictionary, "job.aboutCompany")}</TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent>
                                    <TabsContent value="description" className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">{t(dictionary, "job.description")}</h3>
                                            <div className="prose prose-sm max-w-none">
                                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="requirements" className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">{t(dictionary, "job.requirements")}</h3>
                                            <ul className="space-y-2">
                                                {job.skills?.length > 0 ? job.skills.map((skill: string, index: number) => (
                                                    <li key={index} className="flex items-start">
                                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                        <span className="text-muted-foreground">{skill}</span>
                                                    </li>
                                                )) : <li className="text-muted-foreground">{t(dictionary, "job.noSkills")}</li>}
                                            </ul>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="company" className="space-y-4">
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="w-16 h-16">
                                                <AvatarImage src={job.company.logoUrl || "/placeholder.svg"} alt={job.company.name} />
                                                <AvatarFallback>
                                                    <Building2 className="w-8 h-8" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-2">{job.company.name}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-2" />
                                                        {job.company.address}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Users className="w-4 h-4 mr-2" />
                                                        {job.company.companySize}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Building2 className="w-4 h-4 mr-2" />
                                                        {job.company.industry}
                                                    </div>
                                                    {job.company.website && (
                                                        <div className="flex items-center">
                                                            <Globe className="w-4 h-4 mr-2" />
                                                            <a
                                                                href={job.company.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline"
                                                            >
                                                                {t(dictionary, "profile.website")}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed">{job.company.description}</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Role-specific sidebar content */}
                        {isJobOwner && (
                            <RecruiterJobActions job={job} onJobDeleted={handleJobDeleted} locale={locale} dictionary={dictionary} />
                        )}

                        {/* Job Information */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>{t(dictionary, "job.title")} {t(dictionary, "info.title")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t(dictionary, "job.type")}</span>
                                    <Badge variant={getJobTypeVariant(job.jobType)}>{getJobTypeLabel(job.jobType)}</Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t(dictionary, "job.salary")}</span>
                                    <span className="font-medium">{job.salary?.formattedSalary || "Negotiable"}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t(dictionary, "job.location")}</span>
                                    <span className="font-medium text-right">{job.location}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t(dictionary, "job.openings")}</span>
                                    <span className="font-medium">{job.numberOfOpenings ?? "N/A"}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t(dictionary, "job.deadline")}</span>
                                    <span className="font-medium">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "N/A"}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Similar Jobs - Only show for non-recruiters */}
                        {!isJobOwner && (
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle>Similar Jobs</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                                            <h4 className="font-medium mb-1">Senior Developer</h4>
                                            <p className="text-sm text-muted-foreground mb-2">Tech Company</p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>$80k - $120k</span>
                                                <span>2 days ago</span>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full bg-transparent" asChild>
                                        <Link href={`/${locale}/jobs`}>{t(dictionary, "button.viewDetails")}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Information - Only show for non-recruiters */}
                        {!isJobOwner && (
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle>{t(dictionary, "job.contactInfo")}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {t(dictionary, "job.contactInfoDescription")}
                                        </p>
                                        <div className="space-y-2">
                                            <Button variant="outline" className="w-full bg-transparent">
                                                <Mail className="w-4 h-4 mr-2" />
                                                {t(dictionary, "job.sendMessage")}
                                            </Button>
                                            <Button variant="outline" className="w-full bg-transparent">
                                                <Phone className="w-4 h-4 mr-2" />
                                                {t(dictionary, "job.scheduleCall")}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 