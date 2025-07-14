import type { ApplicationStatus } from "@/lib/types"
import type { Dictionary } from "@/lib/types"
import { t } from "@/lib/i18n-client"

export interface StatusConfig {
    label: string
    icon: string
    variant: "default" | "secondary" | "destructive" | "outline"
    color: string
    bgColor: string
}

export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    APPLIED: {
        label: "Applied",
        icon: "FileText",
        variant: "secondary",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    IN_REVIEW: {
        label: "In Review",
        icon: "Clock",
        variant: "default",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
    },
    INTERVIEW: {
        label: "Interview",
        icon: "Calendar",
        variant: "secondary",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
    },
    OFFERED: {
        label: "Offered",
        icon: "CheckCircle",
        variant: "default",
        color: "text-green-600",
        bgColor: "bg-green-50",
    },
    REJECTED: {
        label: "Rejected",
        icon: "X",
        variant: "destructive",
        color: "text-red-600",
        bgColor: "bg-red-50",
    },
}

export const getScoreMetrics = (score: number) => {
    if (score >= 80) {
        return {
            level: "excellent",
            color: "text-green-600",
            bgColor: "bg-green-50",
            gradient: "from-green-500 to-green-600",
            emoji: "🎯",
            label: "Excellent Match",
        }
    }
    if (score >= 60) {
        return {
            level: "good",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            gradient: "from-yellow-500 to-yellow-600",
            emoji: "👍",
            label: "Good Match",
        }
    }
    return {
        level: "fair",
        color: "text-red-600",
        bgColor: "bg-red-50",
        gradient: "from-red-500 to-red-600",
        emoji: "📊",
        label: "Fair Match",
    }
}

export const formatApplicationDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    } catch (error) {
        return "Invalid date"
    }
}

export const getInitials = (fullName: string): string => {
    return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
}

// Internationalized utility functions

/**
 * Get translated status label
 */
export const getStatusTranslation = (status: ApplicationStatus, dictionary: Dictionary): string => {
    const statusKey = `candidateStatus.${status.toLowerCase()}`
    return t(dictionary, statusKey)
}

/**
 * Format application date with locale support
 */
export const formatApplicationDateLocalized = (dateString: string, locale: string = "en-US"): string => {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString(locale, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    } catch (error) {
        return "Invalid date"
    }
}

/**
 * Get translated score metrics
 */
export const getScoreMetricsTranslated = (score: number, dictionary: Dictionary) => {
    const baseMetrics = getScoreMetrics(score)

    if (score >= 80) {
        return {
            ...baseMetrics,
            label: t(dictionary, "candidateModal.excellentMatch"),
        }
    }
    if (score >= 60) {
        return {
            ...baseMetrics,
            label: t(dictionary, "candidateModal.goodMatch"),
        }
    }
    return {
        ...baseMetrics,
        label: t(dictionary, "candidateModal.fairMatch"),
    }
}

/**
 * Get available status transitions for a given current status
 */
export const getAvailableStatusTransitions = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
    const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
        APPLIED: ["IN_REVIEW", "REJECTED"],
        IN_REVIEW: ["INTERVIEW", "REJECTED"],
        INTERVIEW: ["OFFERED", "REJECTED"],
        OFFERED: ["REJECTED"], // Can still reject after offering
        REJECTED: [], // Terminal state
    }

    return transitions[currentStatus] || []
}

/**
 * Check if a status transition is valid
 */
export const isValidStatusTransition = (from: ApplicationStatus, to: ApplicationStatus): boolean => {
    const availableTransitions = getAvailableStatusTransitions(from)
    return availableTransitions.includes(to)
}

/**
 * Get status priority for sorting (lower number = higher priority)
 */
export const getStatusPriority = (status: ApplicationStatus): number => {
    const priorities: Record<ApplicationStatus, number> = {
        OFFERED: 1,
        INTERVIEW: 2,
        IN_REVIEW: 3,
        APPLIED: 4,
        REJECTED: 5,
    }
    return priorities[status] || 999
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Sanitize filename for download
 */
export const sanitizeFilename = (filename: string): string => {
    return filename
        .replace(/[^a-zA-Z0-9.\-_]/g, "_")
        .replace(/_{2,}/g, "_")
        .replace(/^_|_$/g, "")
}

/**
 * Generate CV filename for candidate
 */
export const generateCVFilename = (candidateName: string, format: string = "pdf"): string => {
    const sanitizedName = sanitizeFilename(candidateName)
    const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    return `CV_${sanitizedName}_${timestamp}.${format}`
}

/**
 * Parse and validate score value
 */
export const parseScore = (score: any): number | null => {
    if (typeof score === "number" && !isNaN(score) && score >= 0 && score <= 100) {
        return score
    }

    if (typeof score === "string") {
        const parsed = parseFloat(score)
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            return parsed
        }
    }

    return null
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export const getRelativeTime = (dateString: string, locale: string = "en"): string => {
    try {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return "just now"
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
        if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`

        return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
    } catch (error) {
        return "unknown"
    }
}

/**
 * Debounce function for search and other operations
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Check if candidate data is complete for application
 */
export const isCandidateDataComplete = (candidate: any): boolean => {
    return !!(
        candidate?.fullName &&
        candidate?.email &&
        validateEmail(candidate.email) &&
        (candidate?.phoneNumber ? validatePhoneNumber(candidate.phoneNumber) : true)
    )
}
