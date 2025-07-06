export type ApplicationStatus = "APPLIED" | "IN_REVIEW" | "INTERVIEW" | "OFFERED" | "REJECTED"

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
