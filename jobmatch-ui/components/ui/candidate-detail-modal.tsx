"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Download,
    Mail,
    Phone,
    Calendar,
    Award,
    Star,
    FileText,
    CheckCircle,
    Clock,
    User,
    Brain,
    Target,
    TrendingUp,
    X,
    ExternalLink,
    AlertCircle,
} from "lucide-react"

import { useCandidateModal } from "@/hooks/use-candidate-modal"
import {
    type ApplicationStatus,
    STATUS_CONFIG,
    getScoreMetrics,
    getInitials,
    formatApplicationDate,
    validateEmail,
    validatePhoneNumber,
} from "@/lib/candidate-utils"
import { CandidateWithApplication } from "@/lib/types"
import { ApiError } from "@/lib/api"
import { useState } from "react"



interface CandidateDetailModalProps {
    isOpen: boolean
    onClose: () => void
    candidate: CandidateWithApplication | null
    onStatusUpdate?: (applicationId: string, newStatus: ApplicationStatus) => Promise<void>
}

const STATUS_ICONS = {
    FileText,
    Clock,
    Calendar,
    CheckCircle,
    X,
}

export function CandidateDetailModal({ isOpen, onClose, candidate, onStatusUpdate }: CandidateDetailModalProps) {
    const {
        isUpdating,
        error,
        handleStatusUpdate,
        handleEmailClick,
        handlePhoneClick,
        handleCVAction,
        availableStatusUpdates,
        clearError,
        setError,
    } = useCandidateModal({ candidate, onStatusUpdate })

    // Confirmation dialog state
    const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null)
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

    // Handler for status change request
    const requestStatusChange = (newStatus: ApplicationStatus) => {
        setPendingStatus(newStatus)
        setIsStatusDialogOpen(true)
    }

    // Handler for confirming status change
    const confirmStatusChange = async () => {
        if (!pendingStatus) return
        setIsStatusDialogOpen(false)
        try {
            await handleStatusUpdate(pendingStatus)
        } catch (err: any) {
            setError(err?.message || "Failed to update status")
        } finally {
            setPendingStatus(null)
        }
    }

    // Early return if no candidate
    if (!candidate) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>No candidate data available. Please try again.</AlertDescription>
                    </Alert>
                </DialogContent>
            </Dialog>
        )
    }

    const statusConfig = STATUS_CONFIG[candidate.status]
    const StatusIcon = STATUS_ICONS[statusConfig.icon as keyof typeof STATUS_ICONS]
    const scoreMetrics = candidate.matchScore ? getScoreMetrics(candidate.matchScore) : null
    const isValidEmail = validateEmail(candidate.candidate.email)
    const isValidPhone = candidate.candidate.phoneNumber ? validatePhoneNumber(candidate.candidate.phoneNumber) : false

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Confirmation Dialog for Status Change */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Status Change</DialogTitle>
                        <DialogDescription>
                            Changing the application status is <b>one-way</b> and cannot be undone.<br />
                            <span>
                                <b>Current status:</b> {candidate?.status.replace('_', ' ')}<br />
                                <b>Destination status:</b> {pendingStatus?.replace('_', ' ')}
                            </span>
                            <br />Are you sure you want to proceed?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsStatusDialogOpen(false); setPendingStatus(null) }}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmStatusChange}
                            disabled={isUpdating}
                        >
                            Yes, Change Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <DialogContent className="sm:max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
                {/* Fixed Header */}
                <div className="flex-shrink-0 border-b bg-white p-6 sticky top-0 z-10">
                    <DialogHeader>
                        <div className="flex items-start space-x-4">
                            <Avatar className="h-16 w-16 flex-shrink-0">
                                <AvatarImage
                                    src={candidate.candidate.avatarUrl || "/placeholder.svg?height=64&width=64"}
                                    alt={`${candidate.candidate.fullName}'s avatar`}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                                    {getInitials(candidate.candidate.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-2xl font-bold mb-1 truncate">{candidate.candidate.fullName}</DialogTitle>
                                <DialogDescription className="text-base mb-3 truncate">{candidate.candidate.email}</DialogDescription>
                                <div className="flex items-center flex-wrap gap-2">
                                    <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                                        <StatusIcon className="h-3 w-3" />
                                        {statusConfig.label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Applied {formatApplicationDate(candidate.appliedDate)}
                                    </span>
                                    {candidate.matchScore && scoreMetrics && (
                                        <Badge variant="outline" className={`${scoreMetrics.color} border-current`}>
                                            <Star className="w-3 h-3 mr-1" />
                                            {Math.round(candidate.matchScore)}% Match
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <User className="w-5 h-5 mr-2" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">Email</p>
                                                <p className={`text-sm truncate ${isValidEmail ? "text-gray-600" : "text-red-500"}`}>
                                                    {candidate.candidate.email}
                                                </p>
                                                {!isValidEmail && <p className="text-xs text-red-500">Invalid email format</p>}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEmailClick}
                                            disabled={!isValidEmail}
                                            className="flex-shrink-0 bg-transparent"
                                        >
                                            <Mail className="w-4 h-4 mr-1" />
                                            Email
                                        </Button>
                                    </div>

                                    {candidate.candidate.phoneNumber && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Phone className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">Phone</p>
                                                    <p className={`text-sm ${isValidPhone ? "text-gray-600" : "text-red-500"}`}>
                                                        {candidate.candidate.phoneNumber}
                                                    </p>
                                                    {!isValidPhone && <p className="text-xs text-red-500">Invalid phone format</p>}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handlePhoneClick}
                                                disabled={!isValidPhone}
                                                className="flex-shrink-0 bg-transparent"
                                            >
                                                <Phone className="w-4 h-4 mr-1" />
                                                Call
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CV Download */}
                            {candidate.cvId ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-lg">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Resume/CV
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {candidate.candidate.fullName}'s CV
                                                    </p>
                                                    <p className="text-xs text-gray-500">Resume Document</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Button className="w-full" onClick={() => handleCVAction("download")}>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download CV
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full bg-transparent"
                                                    onClick={() => handleCVAction("view")}
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    View CV
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-lg">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Resume/CV
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-muted-foreground text-center">No CV uploaded by this candidate.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Cover Letter */}
                            {candidate.coverLetter && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-lg">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Cover Letter
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-48 w-full rounded-lg border bg-gray-50 p-4">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{candidate.coverLetter}</p>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Match Score */}
                            {candidate.matchScore && scoreMetrics && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-lg">
                                            <Target className="w-5 h-5 mr-2" />
                                            Job Match Score
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-center p-6 rounded-lg ${scoreMetrics.bgColor}`}>
                                            <div
                                                className={`text-5xl font-bold mb-3 bg-gradient-to-r ${scoreMetrics.gradient} bg-clip-text text-transparent`}
                                            >
                                                {Math.round(candidate.matchScore)}%
                                            </div>
                                            <p className="text-lg font-medium text-gray-700 mb-3">
                                                {scoreMetrics.emoji} {scoreMetrics.label}
                                            </p>
                                            <Progress value={candidate.matchScore} className="h-3 mb-3" />
                                            <p className="text-sm text-gray-600">
                                                This candidate matches {Math.round(candidate.matchScore)}% of job requirements
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Application Status & Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Application Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Current Status */}
                                    <div className={`text-center p-4 rounded-lg ${statusConfig.bgColor}`}>
                                        <div className="flex items-center justify-center space-x-2 mb-2">
                                            <StatusIcon className="w-4 h-4" />
                                            <Badge variant={statusConfig.variant} className="text-sm">
                                                {statusConfig.label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Applied on {formatApplicationDate(candidate.appliedDate)}
                                        </p>
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="flex items-center justify-between">
                                                <span>{error}</span>
                                                <Button variant="ghost" size="sm" onClick={clearError} className="h-auto p-1 text-xs">
                                                    Dismiss
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Status Update Actions */}
                                    {availableStatusUpdates.length > 0 && onStatusUpdate && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h4 className="text-sm font-medium mb-3">Update Status</h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {availableStatusUpdates.map((newStatus) => {
                                                        const config = STATUS_CONFIG[newStatus]
                                                        const Icon = STATUS_ICONS[config.icon as keyof typeof STATUS_ICONS]

                                                        return (
                                                            <Button
                                                                key={newStatus}
                                                                variant={newStatus === "REJECTED" ? "destructive" : "outline"}
                                                                size="sm"
                                                                onClick={() => requestStatusChange(newStatus)}
                                                                disabled={isUpdating}
                                                                className="justify-start"
                                                            >
                                                                <Icon className="w-4 h-4 mr-2" />
                                                                {isUpdating ? "Updating..." : `Move to ${config.label}`}
                                                            </Button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
