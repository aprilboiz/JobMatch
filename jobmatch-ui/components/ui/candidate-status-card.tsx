"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, CheckCircle, X, FileText, AlertCircle } from "lucide-react"
import { type ApplicationStatus, STATUS_CONFIG, formatApplicationDate } from "@/lib/candidate-utils"

interface CandidateStatusCardProps {
    status: ApplicationStatus
    appliedDate: string
    availableStatusUpdates: ApplicationStatus[]
    isUpdating: boolean
    error: string | null
    onStatusUpdate: (status: ApplicationStatus) => void
    onClearError: () => void
}

const STATUS_ICONS = {
    FileText,
    Clock,
    Calendar,
    CheckCircle,
    X,
}

export function CandidateStatusCard({
    status,
    appliedDate,
    availableStatusUpdates,
    isUpdating,
    error,
    onStatusUpdate,
    onClearError,
}: CandidateStatusCardProps) {
    const statusConfig = STATUS_CONFIG[status]
    const StatusIcon = STATUS_ICONS[statusConfig.icon as keyof typeof STATUS_ICONS]

    return (
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
                    <p className="text-sm text-gray-600">Applied on {formatApplicationDate(appliedDate)}</p>
                </div>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button variant="ghost" size="sm" onClick={onClearError} className="h-auto p-1 text-xs">
                                Dismiss
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Status Update Actions */}
                {availableStatusUpdates.length > 0 && (
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
                                            onClick={() => onStatusUpdate(newStatus)}
                                            disabled={isUpdating}
                                            className="justify-start"
                                            aria-label={`Update status to ${config.label}`}
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
    )
}
