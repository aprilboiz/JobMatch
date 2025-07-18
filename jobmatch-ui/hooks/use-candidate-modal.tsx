"use client"

import { useState, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import type { ApplicationStatus } from "@/lib/types"
import { apiClient } from "@/lib/api"
import { downloadCv, downloadCvById } from "@/lib/cv-utils"
import { CandidateWithApplication } from "@/lib/types"

interface UseCandidateModalProps {
    candidate: CandidateWithApplication | null
    onStatusUpdate?: (applicationId: string, newStatus: ApplicationStatus) => Promise<void>
}

export function useCandidateModal({ candidate, onStatusUpdate }: UseCandidateModalProps) {
    const { toast } = useToast()
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleStatusUpdate = useCallback(
        async (newStatus: ApplicationStatus) => {
            if (!candidate || !onStatusUpdate) return

            if (candidate.status === newStatus) {
                toast({
                    title: "No Change",
                    description: "Candidate already has this status",
                    variant: "default",
                })
                return
            }

            setIsUpdating(true)
            setError(null)

            try {
                await onStatusUpdate(candidate.id.toString(), newStatus)
                toast({
                    title: "Status Updated",
                    description: `Candidate status changed to ${newStatus.replace("_", " ").toLowerCase()}`,
                    variant: "default",
                })
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to update status"
                setError(errorMessage)
                toast({
                    title: "Update Failed",
                    description: errorMessage,
                    variant: "destructive",
                })
            } finally {
                setIsUpdating(false)
            }
        },
        [candidate, onStatusUpdate, toast],
    )

    const handleEmailClick = useCallback(() => {
        if (!candidate?.candidate.email) return

        try {
            window.open(`mailto:${candidate.candidate.email}`, "_blank")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to open email client",
                variant: "destructive",
            })
        }
    }, [candidate?.candidate.email, toast])

    const handlePhoneClick = useCallback(() => {
        if (!candidate?.candidate.phoneNumber) return

        try {
            window.open(`tel:${candidate.candidate.phoneNumber}`, "_blank")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to initiate phone call",
                variant: "destructive",
            })
        }
    }, [candidate?.candidate.phoneNumber, toast])

    const handleCVAction = useCallback(
        async (action: "download" | "view") => {
            if (!candidate?.cvId) {
                toast({
                    title: "Error",
                    description: "CV file not available",
                    variant: "destructive",
                })
                return
            }

            try {
                if (action === "download") {
                    await downloadCvById(candidate.cvId.toString(), `${candidate.candidate.fullName}_CV`)
                    return
                }

                // For viewing, fetch the blob and open as before
                const blob = await apiClient.downloadCV(candidate.cvId.toString())

                // For viewing, create a blob URL with the correct MIME type
                const mimeType = blob.type || "application/pdf"
                const typedBlob = new Blob([blob], { type: mimeType })
                const url = window.URL.createObjectURL(typedBlob)
                window.open(url, "_blank")

                // Clean up
                setTimeout(() => window.URL.revokeObjectURL(url), 10000)
            } catch (error) {
                toast({
                    title: "Error",
                    description: `Failed to ${action} CV`,
                    variant: "destructive",
                })
            }
        },
        [candidate?.cvId, candidate?.candidate.fullName, toast],
    )

    const availableStatusUpdates = useMemo(() => {
        if (!candidate) return []

        const currentStatus = candidate.status
        const allStatuses: ApplicationStatus[] = ["APPLIED", "IN_REVIEW", "INTERVIEW", "OFFERED", "REJECTED"]

        return allStatuses.filter((status) => status !== currentStatus)
    }, [candidate])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        isUpdating,
        error,
        handleStatusUpdate,
        handleEmailClick,
        handlePhoneClick,
        handleCVAction,
        availableStatusUpdates,
        clearError,
        setError,
    }
}
