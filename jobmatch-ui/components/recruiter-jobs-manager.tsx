"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, Edit, Trash2, Eye, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Job } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { CandidateManager } from "@/components/candidate-manager"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"

// Extended job type with application count
interface JobWithApplicationCount extends Job {
    applicationCount: number
}

export function RecruiterJobsManager() {
    const [jobs, setJobs] = useState<JobWithApplicationCount[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean
        jobId: string | null
        jobTitle: string
        isDeleting: boolean
    }>({
        isOpen: false,
        jobId: null,
        jobTitle: "",
        isDeleting: false
    })
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        loadJobs()
    }, [])

    const loadJobs = async () => {
        try {
            const response = await apiClient.getRecruiterJobs({ page: 0, size: 10 })
            if (response.success) {
                // Load jobs with application counts
                const jobsWithCounts = await Promise.all(
                    response.data.content.map(async (job) => {
                        try {
                            const applicationsResponse = await apiClient.getApplicationsForJob(
                                job.id.toString(),
                                { page: 0, size: 1 }
                            )
                            return {
                                ...job,
                                applicationCount: applicationsResponse.success ? applicationsResponse.data.totalElements : 0
                            }
                        } catch (error) {
                            // If we can't get application count, default to 0
                            return {
                                ...job,
                                applicationCount: 0
                            }
                        }
                    })
                )
                setJobs(jobsWithCounts)
            } else {
                throw new Error(response.message)
            }
        } catch (error) {
            console.error("Failed to load jobs:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load jobs. Please try refreshing the page.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteClick = (jobId: string, jobTitle: string) => {
        setDeleteModal({
            isOpen: true,
            jobId,
            jobTitle,
            isDeleting: false
        })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteModal.jobId) return

        setDeleteModal(prev => ({ ...prev, isDeleting: true }))

        try {
            await apiClient.deleteJob(deleteModal.jobId)
            toast({
                title: "Success",
                description: "Job deleted successfully",
            })
            setDeleteModal({
                isOpen: false,
                jobId: null,
                jobTitle: "",
                isDeleting: false
            })
            loadJobs() // Reload the jobs list
        } catch (error) {
            console.error("Failed to delete job:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete job. Please try again.",
            })
            setDeleteModal(prev => ({ ...prev, isDeleting: false }))
        }
    }

    const handleDeleteCancel = () => {
        setDeleteModal({
            isOpen: false,
            jobId: null,
            jobTitle: "",
            isDeleting: false
        })
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "OPEN":
                return "default"
            case "CLOSED":
                return "secondary"
            case "EXPIRED":
                return "destructive"
            default:
                return "secondary"
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // If a job is selected, show the candidate manager
    if (selectedJobId) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setSelectedJobId(null)} className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        Back to Jobs
                    </Button>
                    <h2 className="text-xl font-semibold">
                        {jobs.find(job => job.id.toString() === selectedJobId)?.title} - Candidates
                    </h2>
                </div>
                <CandidateManager jobId={selectedJobId} />
            </div>
        )
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Job Postings</CardTitle>
                    <Button onClick={() => router.push("/jobs/create")} className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Post a Job
                    </Button>
                </CardHeader>
                <CardContent>
                    {jobs.length === 0 ? (
                        <div className="text-center py-8">
                            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No job postings yet</p>
                            <p className="text-sm text-muted-foreground">Create your first job posting to get started</p>
                            <Button className="mt-4" onClick={() => router.push("/jobs/create")}>
                                Post a Job
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                            <Briefcase className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{job.title}</h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {job.numberOfOpenings} {job.numberOfOpenings === 1 ? "opening" : "openings"}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push(`/jobs/${job.id}`)}
                                            title="View Job"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedJobId(job.id.toString())}
                                            title="View Candidates"
                                            className="relative"
                                        >
                                            <Users className="w-4 h-4" />
                                            {job.applicationCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
                                                >
                                                    {job.applicationCount > 99 ? "99+" : job.applicationCount}
                                                </Badge>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push(`/jobs/edit/${job.id}`)}
                                            title="Edit Job"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(job.id.toString(), job.title)}
                                            className="text-red-500 hover:text-red-600"
                                            title="Delete Job"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Job Posting"
                description={`Are you sure you want to delete "${deleteModal.jobTitle}"? This action cannot be undone and will affect all pending applications.`}
                isLoading={deleteModal.isDeleting}
            />
        </>
    )
} 