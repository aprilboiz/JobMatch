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
    STATUS_CONFIG,
    getScoreMetrics,
    getInitials,
    formatApplicationDate,
    validateEmail,
    validatePhoneNumber,
} from "@/lib/candidate-utils"
import type { ApplicationStatus } from "@/lib/types"
import { CandidateWithApplication, Dictionary } from "@/lib/types"
import { ApiError } from "@/lib/api"
import { useState } from "react"
import { t } from "@/lib/i18n-client"



interface CandidateDetailModalProps {
    isOpen: boolean
    onClose: () => void
    candidate: CandidateWithApplication | null
    onStatusUpdate?: (applicationId: string, newStatus: ApplicationStatus) => Promise<void>
    locale: string
    dictionary: Dictionary
}

const STATUS_ICONS = {
    FileText,
    Clock,
    Calendar,
    CheckCircle,
    X,
}

export function CandidateDetailModal({ isOpen, onClose, candidate, onStatusUpdate, locale, dictionary }: CandidateDetailModalProps) {
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
                        <AlertDescription>{t(dictionary, "candidateModal.noCandidateData")}</AlertDescription>
                    </Alert>
                </DialogContent>
            </Dialog>
        )
    }

    const statusConfig = STATUS_CONFIG[candidate.status as keyof typeof STATUS_CONFIG]
    const StatusIcon = STATUS_ICONS[statusConfig.icon as keyof typeof STATUS_ICONS]
    const scoreMetrics = candidate.analysis?.score ? getScoreMetrics(candidate.analysis.score) : null
    const isValidEmail = validateEmail(candidate.candidate.email)
    const isValidPhone = candidate.candidate.phoneNumber ? validatePhoneNumber(candidate.candidate.phoneNumber) : false

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Confirmation Dialog for Status Change */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t(dictionary, "candidateModal.confirmStatusChange")}</DialogTitle>
                        <DialogDescription>
                            {t(dictionary, "candidateModal.statusChangeWarning")}<br />
                            <span>
                                <b>{t(dictionary, "candidateModal.currentStatus")}:</b> {candidate?.status.replace('_', ' ')}<br />
                                <b>{t(dictionary, "candidateModal.destinationStatus")}:</b> {pendingStatus?.replace('_', ' ')}
                            </span>
                            <br />{t(dictionary, "candidateModal.confirmProceed")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsStatusDialogOpen(false); setPendingStatus(null) }}>{t(dictionary, "button.cancel")}</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmStatusChange}
                            disabled={isUpdating}
                        >
                            {t(dictionary, "candidateModal.yesChangeStatus")}
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
                                        {t(dictionary, "candidateModal.applied")} {formatApplicationDate(candidate.appliedDate)}
                                    </span>
                                    {candidate.analysis?.score && scoreMetrics && (
                                        <Badge variant="outline" className={`${scoreMetrics.color} border-current`}>
                                            <Brain className="w-3 h-3 mr-1" />
                                            {Math.round(candidate.analysis.score)}% {t(dictionary, "candidateModal.match")}
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
                                        {t(dictionary, "candidateModal.contactInformation")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">{t(dictionary, "candidateModal.email")}</p>
                                                <p className={`text-sm truncate ${isValidEmail ? "text-gray-600" : "text-red-500"}`}>
                                                    {candidate.candidate.email}
                                                </p>
                                                {!isValidEmail && <p className="text-xs text-red-500">{t(dictionary, "candidateModal.invalidEmailFormat")}</p>}
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
                                            {t(dictionary, "candidateModal.email")}
                                        </Button>
                                    </div>

                                    {candidate.candidate.phoneNumber && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Phone className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">{t(dictionary, "candidateModal.phone")}</p>
                                                    <p className={`text-sm ${isValidPhone ? "text-gray-600" : "text-red-500"}`}>
                                                        {candidate.candidate.phoneNumber}
                                                    </p>
                                                    {!isValidPhone && <p className="text-xs text-red-500">{t(dictionary, "candidateModal.invalidPhoneFormat")}</p>}
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
                                                {t(dictionary, "candidateModal.call")}
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
                                            {t(dictionary, "candidateModal.resumeCV")}
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
                                                    <p className="text-xs text-gray-500">{t(dictionary, "candidateModal.resumeDocument")}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Button className="w-full" onClick={() => handleCVAction("download")}>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    {t(dictionary, "candidateModal.downloadCV")}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full bg-transparent"
                                                    onClick={() => handleCVAction("view")}
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    {t(dictionary, "candidateModal.viewCV")}
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
                                            {t(dictionary, "candidateModal.resumeCV")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-muted-foreground text-center">{t(dictionary, "candidateModal.noCVUploaded")}</p>
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
                                            {t(dictionary, "candidateModal.coverLetter")}
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
                            {candidate.analysis?.score && scoreMetrics && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-lg">
                                            <Target className="w-5 h-5 mr-2" />
                                            {t(dictionary, "candidateModal.jobMatchScore")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">{t(dictionary, "candidateModal.overallMatch")}</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={scoreMetrics.color}>
                                                        {scoreMetrics.label}
                                                    </Badge>
                                                    <span className="text-lg font-semibold text-primary">
                                                        {Math.round(candidate.analysis.score)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <Progress value={candidate.analysis.score} className="h-3 mb-3" />
                                            <p className="text-sm text-muted-foreground">
                                                {t(dictionary, "candidateModal.matchPercentage").replace("{percentage}", Math.round(candidate.analysis.score).toString())}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Detailed Match Analysis */}
                            {candidate.analysis && (candidate.analysis.matchSkills || candidate.analysis.missingSkills) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-lg">
                                            <Brain className="w-5 h-5 mr-2" />
                                            {t(dictionary, "candidateModal.matchAnalysisDetails")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Matching Skills */}
                                        {candidate.analysis.matchSkills && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <h5 className="font-medium text-green-700">{t(dictionary, "candidateModal.matchingSkills")}</h5>
                                                </div>
                                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-800 leading-relaxed">
                                                        {candidate.analysis.matchSkills}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Missing Skills */}
                                        {candidate.analysis.missingSkills && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <X className="w-4 h-4 text-amber-600" />
                                                    <h5 className="font-medium text-amber-700">{t(dictionary, "candidateModal.areasForImprovement")}</h5>
                                                </div>
                                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                    <p className="text-sm text-amber-800 leading-relaxed">
                                                        {candidate.analysis.missingSkills}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Analysis Summary */}
                                        {candidate.analysis.score && (
                                            <div className="pt-2 border-t">
                                                <div className="flex items-start gap-2">
                                                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <h5 className="font-medium text-blue-700 mb-1">{t(dictionary, "candidateModal.aiAssessment")}</h5>
                                                        <p className="text-sm text-blue-800">
                                                            {candidate.analysis.score >= 80
                                                                ? t(dictionary, "candidateModal.excellentAlignment")
                                                                : candidate.analysis.score >= 60
                                                                    ? t(dictionary, "candidateModal.goodPotential")
                                                                    : t(dictionary, "candidateModal.significantTraining")
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Application Status & Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        {t(dictionary, "candidateModal.applicationStatus")}
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
                                            {t(dictionary, "candidateModal.appliedOn")} {formatApplicationDate(candidate.appliedDate)}
                                        </p>
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="flex items-center justify-between">
                                                <span>{error}</span>
                                                <Button variant="ghost" size="sm" onClick={clearError} className="h-auto p-1 text-xs">
                                                    {t(dictionary, "candidateModal.dismiss")}
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Status Update Actions */}
                                    {availableStatusUpdates.length > 0 && onStatusUpdate && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h4 className="text-sm font-medium mb-3">{t(dictionary, "candidateModal.updateStatus")}</h4>
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
                                                                {isUpdating ? t(dictionary, "candidateModal.updating") : `${t(dictionary, "candidateModal.moveTo")} ${config.label}`}
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
