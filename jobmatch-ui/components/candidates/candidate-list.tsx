"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/api"
import { CandidateWithApplication, ApplicationStatus } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Brain,
    Users,
    Search,
    Download,
    Mail,
    Phone,
    Calendar,
    Eye,
    MessageSquare,
    CheckCircle,
    UserCheck,
    UserX,
    MoreHorizontal,
    SortAsc,
    SortDesc,
    TrendingUp,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CandidateDetailModal } from "@/components/ui/candidate-detail-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { downloadCvById } from "@/lib/cv-utils"
import { Skeleton } from "@/components/ui/skeleton"

async function fetchCandidates(jobId: string) {
    const response = await apiClient.getApplicationsForJob(jobId, { page: 0, size: 100 })
    if (response.success) {
        return response.data.content.map((c) => ({
            ...c,
            matchScore: c.analysis?.score ?? Math.random() * 100,
        })) as CandidateWithApplication[]
    }
    return [] as CandidateWithApplication[]
}

export function CandidateList({ jobId }: { jobId: string }) {
    const { data: candidates } = useSWR(["candidates", jobId], () => fetchCandidates(jobId), {
        suspense: true,
    })
    const { toast } = useToast()
    const [filteredCandidates, setFilteredCandidates] = useState<CandidateWithApplication[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all")
    const [scoreFilter, setScoreFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("appliedDate")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithApplication | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [pendingStatusChange, setPendingStatusChange] = useState<{
        applicationId: string
        newStatus: ApplicationStatus
    } | null>(null)
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
    const [localCandidates, setLocalCandidates] = useState<CandidateWithApplication[]>(candidates || [])

    useEffect(() => {
        if (candidates) {
            setLocalCandidates(candidates)
        }
    }, [candidates])

    useEffect(() => {
        filterAndSortCandidates()
    }, [localCandidates, searchTerm, statusFilter, scoreFilter, sortBy, sortOrder])

    const filterAndSortCandidates = () => {
        let filtered = [...localCandidates]

        // Apply filters
        filtered = filtered.filter((candidate) => {
            const matchesSearch =
                searchTerm === "" ||
                candidate.candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === "all" || candidate.status === statusFilter

            const score = candidate.analysis?.score || 0
            const matchesScore =
                scoreFilter === "all" ||
                (scoreFilter === "high" && score >= 80) ||
                (scoreFilter === "medium" && score >= 60 && score < 80) ||
                (scoreFilter === "low" && score < 60)

            return matchesSearch && matchesStatus && matchesScore
        })

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = sortBy === "appliedDate" ? new Date(a.appliedDate).getTime() : a.analysis?.score || 0
            const bValue = sortBy === "appliedDate" ? new Date(b.appliedDate).getTime() : b.analysis?.score || 0
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        })

        setFilteredCandidates(filtered)
    }

    const handleCandidateClick = (candidate: CandidateWithApplication) => {
        setSelectedCandidate(candidate)
        setIsDetailModalOpen(true)
    }

    const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
        setIsStatusDialogOpen(false)
        setPendingStatusChange(null)
        try {
            await apiClient.updateApplicationStatus(applicationId, newStatus)
            setLocalCandidates((prev) =>
                prev.map((candidate) =>
                    candidate.id.toString() === applicationId
                        ? {
                            ...candidate,
                            status: newStatus,
                        }
                        : candidate,
                ),
            )
            toast({
                title: "Success",
                description: "Application status updated",
            })

            // Update the selected candidate if it matches
            if (selectedCandidate && selectedCandidate.id.toString() === applicationId) {
                setSelectedCandidate({
                    ...selectedCandidate,
                    status: newStatus
                })
            }
        } catch (error: any) {
            console.log(error)
            toast({
                variant: "destructive",
                title: "Status Update Error",
                description: error?.message || "Failed to update status",
            })
        }
    }

    const handleBulkAction = async (action: ApplicationStatus) => {
        if (selectedCandidates.length === 0) return

        try {
            await Promise.all(
                selectedCandidates.map((candidateId) => {
                    const candidate = localCandidates.find((c) => c.id === parseInt(candidateId))
                    if (candidate) {
                        return apiClient.updateApplicationStatus(candidateId, action)
                    }
                }),
            )

            setLocalCandidates((prev) =>
                prev.map((candidate) =>
                    selectedCandidates.includes(candidate.id.toString())
                        ? {
                            ...candidate,
                            status: action,
                        }
                        : candidate,
                ),
            )

            setSelectedCandidates([])
            toast({
                title: "Success",
                description: `Updated ${selectedCandidates.length} candidates`,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update candidates",
            })
        }
    }

    const getStatusBadgeVariant = (status: ApplicationStatus) => {
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

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600"
        if (score >= 60) return "text-yellow-600"
        return "text-red-600"
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="grid grid-cols-2 md:flex md:items-center gap-4">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="APPLIED">Applied</SelectItem>
                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                            <SelectItem value="INTERVIEW">Interview</SelectItem>
                            <SelectItem value="OFFERED">Offered</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={scoreFilter} onValueChange={setScoreFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by score" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Scores</SelectItem>
                            <SelectItem value="high">High (80+)</SelectItem>
                            <SelectItem value="medium">Medium (60-79)</SelectItem>
                            <SelectItem value="low">Low (&lt;60)</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        >
                            {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                        </Button>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="appliedDate">Applied Date</SelectItem>
                                <SelectItem value="matchScore">Match Score</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedCandidates.length > 0 && (
                <div className="mb-4 flex items-center gap-4 p-2 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{selectedCandidates.length} selected</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Bulk Actions <MoreHorizontal className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleBulkAction("IN_REVIEW")}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Mark as In Review
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("REJECTED")}>
                                <UserX className="mr-2 h-4 w-4" />
                                Mark as Rejected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Candidate Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCandidates.map((candidate) => (
                    <Card
                        key={candidate.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleCandidateClick(candidate)}
                    >
                        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                            <Checkbox
                                checked={selectedCandidates.includes(candidate.id.toString())}
                                onCheckedChange={(checked) => {
                                    setSelectedCandidates((prev) =>
                                        checked
                                            ? [...prev, candidate.id.toString()]
                                            : prev.filter((id) => id !== candidate.id.toString()),
                                    )
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="mr-2"
                            />
                            <Avatar>
                                <AvatarImage src={candidate.candidate.avatarUrl} />
                                <AvatarFallback>{candidate.candidate.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-base">{candidate.candidate.fullName}</CardTitle>
                                <p className="text-sm text-muted-foreground">{candidate.candidate.email}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge>
                                <div className={`flex items-center font-bold ${getScoreColor(candidate.analysis?.score || 0)}`}>
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    {Math.round(candidate.analysis?.score || 0)}%
                                </div>
                            </div>
                            <Progress value={candidate.analysis?.score} className="h-2" />
                            <div className="text-xs text-muted-foreground flex items-center justify-between">
                                <span className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Applied on {new Date(candidate.appliedDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleCandidateClick(candidate)
                                    }}
                                >
                                    <Eye className="mr-1 h-4 w-4" /> View
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredCandidates.length === 0 && (
                <div className="text-center py-16">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No candidates found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Try adjusting your search or filters.
                    </p>
                </div>
            )}

            {/* Modals */}
            {selectedCandidate && (
                <CandidateDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    candidate={selectedCandidate}
                    onStatusChange={(newStatus) => {
                        setPendingStatusChange({ applicationId: selectedCandidate.id.toString(), newStatus })
                        setIsStatusDialogOpen(true)
                    }}
                    onDownloadCv={() => downloadCvById(selectedCandidate.cvId.toString())}
                />
            )}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Status Change</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to change the status to {pendingStatusChange?.newStatus}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsStatusDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                handleStatusUpdate(pendingStatusChange!.applicationId, pendingStatusChange!.newStatus)
                            }
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function CandidateListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-1/4" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
} 