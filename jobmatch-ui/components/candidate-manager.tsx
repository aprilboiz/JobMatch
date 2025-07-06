"use client"

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
} from "lucide-react"
import { apiClient, ApiError } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CandidateDetailModal } from "@/components/ui/candidate-detail-modal"
import { CandidateWithApplication, ApplicationStatus } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"





export function CandidateManager({ jobId }: { jobId: string }) {
    const { toast } = useToast()
    const [candidates, setCandidates] = useState<CandidateWithApplication[]>([])
    const [filteredCandidates, setFilteredCandidates] = useState<CandidateWithApplication[]>([])
    const [isLoading, setIsLoading] = useState(true)
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

    useEffect(() => {
        if (jobId) {
            loadCandidates()
        }
    }, [jobId])

    useEffect(() => {
        filterAndSortCandidates()
    }, [candidates, searchTerm, statusFilter, scoreFilter, sortBy, sortOrder])

    const loadCandidates = async () => {
        try {
            const response = await apiClient.getApplicationsForJob(jobId, { page: 0, size: 100 })
            if (response.success) {
                const candidatesWithScores = response.data.content.map((c) => ({
                    ...c,
                    matchScore: c.matchScore ?? Math.random() * 100 // fallback for demo
                }))
                setCandidates(candidatesWithScores)
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load candidates",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const filterAndSortCandidates = () => {
        let filtered = [...candidates]

        // Apply filters
        filtered = filtered.filter((candidate) => {
            const matchesSearch =
                searchTerm === "" ||
                candidate.candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === "all" || candidate.status === statusFilter

            const score = candidate.matchScore || 0
            const matchesScore =
                scoreFilter === "all" ||
                (scoreFilter === "high" && score >= 80) ||
                (scoreFilter === "medium" && score >= 60 && score < 80) ||
                (scoreFilter === "low" && score < 60)

            return matchesSearch && matchesStatus && matchesScore
        })

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = sortBy === "appliedDate" ? new Date(a.appliedDate).getTime() : a.matchScore || 0
            const bValue = sortBy === "appliedDate" ? new Date(b.appliedDate).getTime() : b.matchScore || 0
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
            setCandidates((prev) =>
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
                    const candidate = candidates.find((c) => c.id === parseInt(candidateId))
                    if (candidate) {
                        return apiClient.updateApplicationStatus(candidateId, action)
                    }
                }),
            )

            setCandidates((prev) =>
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <>
            {/* Confirmation Dialog for Status Change */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Status Change</DialogTitle>
                        <DialogDescription>
                            Changing the application status is <b>one-way</b> and cannot be undone.<br />
                            <span>
                                <b>Current status:</b> {(() => {
                                    const candidate = candidates.find(c => c.id.toString() === pendingStatusChange?.applicationId)
                                    return candidate ? candidate.status.replace('_', ' ') : "Unknown"
                                })()}<br />
                                <b>Destination status:</b> {pendingStatusChange?.newStatus.replace('_', ' ')}
                            </span>
                            <br />Are you sure you want to proceed?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsStatusDialogOpen(false); setPendingStatusChange(null) }}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (pendingStatusChange) {
                                    handleStatusUpdate(pendingStatusChange.applicationId, pendingStatusChange.newStatus)
                                }
                            }}
                        >
                            Yes, Change Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>Candidates ({filteredCandidates.length})</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            {selectedCandidates.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            Bulk Actions ({selectedCandidates.length})
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleBulkAction("IN_REVIEW")}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            Mark as In Review
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleBulkAction("INTERVIEW")}>
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Schedule Interview
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleBulkAction("REJECTED")} className="text-red-600">
                                            <UserX className="w-4 h-4 mr-2" />
                                            Reject Selected
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "all")}
                        >
                            <SelectTrigger className="w-[180px]">
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
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by match" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Scores</SelectItem>
                                <SelectItem value="high">High Match (80%+)</SelectItem>
                                <SelectItem value="medium">Medium Match (60-79%)</SelectItem>
                                <SelectItem value="low">Low Match (Less than 60%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Candidates List */}
                    <div className="space-y-4">
                        {filteredCandidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                                onClick={() => handleCandidateClick(candidate)}
                            >
                                <div className="flex items-center space-x-4">
                                    <Checkbox
                                        checked={selectedCandidates.includes(candidate.id.toString())}
                                        onCheckedChange={(checked) => {
                                            const candidateId = candidate.id.toString()
                                            if (checked) {
                                                setSelectedCandidates([...selectedCandidates, candidateId])
                                            } else {
                                                setSelectedCandidates(
                                                    selectedCandidates.filter((id) => id !== candidateId),
                                                )
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={candidate.candidate.avatarUrl} alt={candidate.candidate.fullName} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                            {candidate.candidate.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-medium group-hover:text-primary transition-colors">
                                            {candidate.candidate.fullName}
                                        </h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Badge variant={getStatusBadgeVariant(candidate.status)}>
                                                {candidate.status.replace("_", " ")}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                Applied {new Date(candidate.appliedDate).toLocaleDateString()}
                                            </span>
                                            {candidate.matchScore && (
                                                <span className={`text-sm font-medium ${getScoreColor(candidate.matchScore)}`}>
                                                    {Math.round(candidate.matchScore)}% Match
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            window.open(`/api/cvs/${candidate.cvId}/download`, "_blank")
                                        }}
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        CV
                                    </Button>
                                    <Select
                                        value={candidate.status}
                                        onValueChange={(value: ApplicationStatus) => {
                                            setPendingStatusChange({
                                                applicationId: candidate.id.toString(),
                                                newStatus: value
                                            })
                                            setIsStatusDialogOpen(true)
                                        }}
                                    >
                                        <SelectTrigger
                                            className="w-[140px]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <SelectValue placeholder="Update status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="APPLIED">Applied</SelectItem>
                                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                            <SelectItem value="INTERVIEW">Interview</SelectItem>
                                            <SelectItem value="OFFERED">Offered</SelectItem>
                                            <SelectItem value="REJECTED">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCandidateClick(candidate)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Candidate Detail Modal */}
            <CandidateDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                candidate={selectedCandidate}
                onStatusUpdate={handleStatusUpdate}
            />
        </>
    )
} 