// Types
export interface ApiResponse<T> {
    data: T
    message: string
    success: boolean
    timestamp: string
    errors?: string[]
}

export interface LoginRequest {
    email: string
    password: string
}

export interface LogoutRequest {
    token: string
    refreshToken: string
}

export interface AuthResponse {
    tokenType: string
    token: string
    refreshToken: string
    expiresIn: number
}

export interface Company {
    id: string
    name: string
    website?: string
    phoneNumber?: string
    email?: string
    address: string
    companySize: string
    industry: string
    description: string
    logoUrl?: string
}

export interface User {
    id: string
    email: string
    fullName: string
    phoneNumber: string
    avatarUrl?: string
    isActive: boolean
    role: {
        roleName: "CANDIDATE" | "RECRUITER" | "ADMIN"
    }
    userType: "CANDIDATE" | "RECRUITER" | "ADMIN"
    company?: Company
}

export interface Job {
    id: string
    title: string
    description: string
    requirements: string[]
    location: string
    salary: string
    type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE" | "INTERNSHIP"
    status: "OPEN" | "CLOSED" | "DRAFT"
    companyId: string
    company: Company
    postedDate: string
    applicants: number
    views: number
}

export interface Application {
    id: string
    jobId: string
    candidateId: string
    status: "APPLIED" | "IN_REVIEW" | "INTERVIEW" | "OFFERED" | "REJECTED"
    appliedDate: string
    cvId: string
    coverLetter?: string
    aiScore?: number
    job: Job
    candidate: User
}

export interface CV {
    id: string
    fileName: string
    fileUrl: string
    fileSize: number
    updatedAt: string
    candidateId: string
    aiAnalysis?: {
        score: number
        skills: string[]
        experience: string
        education: string
        recommendations: string[]
    }
}

// Paginated response types
export interface PaginatedResponse<T> {
    content: T[]
    pageable: {
        pageNumber: number
        pageSize: number
        sort: {
            sorted: boolean
            unsorted: boolean
            empty: boolean
        }
        offset: number
        paged: boolean
        unpaged: boolean
    }
    totalElements: number
    totalPages: number
    last: boolean
    size: number
    number: number
    sort: {
        sorted: boolean
        unsorted: boolean
        empty: boolean
    }
    first: boolean
    numberOfElements: number
    empty: boolean
}

// AI/Matching types
export interface JobMatchScore {
    score: number
    breakdown: {
        skillsMatch: number
        experienceMatch: number
        educationMatch: number
        locationMatch: number
    }
    recommendations: string[]
}

export interface JobMatch {
    job: Job
    score: number
    breakdown: {
        skillsMatch: number
        experienceMatch: number
        educationMatch: number
        locationMatch: number
    }
    recommendations: string[]
}

export interface CandidateRankingItem {
    candidateId: string
    candidate: {
        id: string
        fullName: string
        email: string
        profilePicture?: string
    }
    score: number
    cv: {
        id: string
        fileName: string
        fileUrl: string
        aiAnalysis?: {
            score: number
            skills: string[]
            experience: string
        }
    }
    application: Application
}

export interface CandidateRanking {
    candidates: CandidateRankingItem[]
}

// Registration request type
export interface RegisterRequest {
    fullName: string
    email: string
    phoneNumber: string
    password: string
    role: "CANDIDATE" | "RECRUITER" | "ADMIN"
}