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

export interface AuthResponse {
    tokenType: string
    token: string
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

export interface SalaryDto {
    salaryType: "FIXED" | "RANGE" | "NEGOTIABLE" | "COMPETITIVE"
    minSalary?: number
    maxSalary?: number
    currency?: "USD" | "VND" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD"
    salaryPeriod?: "ANNUAL" | "MONTHLY" | "WEEKLY" | "HOURLY"
    formattedSalary?: string
    valid?: boolean
}

export interface Job {
    id: number
    title: string
    jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE"
    jobCategory: number
    salary: SalaryDto
    numberOfOpenings: number
    applicationDeadline: string
    description: string
    location: string
    skills: string[]
    status: "OPEN" | "CLOSED" | "EXPIRED"
    company: Company
    recruiterId?: string
    applications?: Application[]
    createdAt: string
    updatedAt: string
}

export interface Application {
    id: string
    jobId: string
    candidateId: string
    status: "APPLIED" | "IN_REVIEW" | "INTERVIEW" | "OFFERED" | "REJECTED"
    appliedDate: string
    cvId: string
    coverLetter?: string
    analysis?: AnalysisResponse
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

export interface BaseProfileUpdateRequest {
    fullName: string
    phoneNumber: string
    companyId?: number
}

export interface CompanyRequest {
    name: string
    website?: string
    phoneNumber?: string
    email?: string
    address: string
    companySize: string
    industry: string
    description?: string
}

export interface Pageable {
    page?: number
    size?: number
    sort?: string[]
}

export interface JobRequest {
    title: string
    jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE"
    jobCategory: number
    salary: SalaryDto
    openings: number
    applicationDeadline: string
    description: string
    location: string
    skills: string[]
}

export interface JobCategory {
    code: number
    name: string
    description: string
}

export type ApplicationStatus = "APPLIED" | "IN_REVIEW" | "INTERVIEW" | "OFFERED" | "REJECTED"

// Analysis response interface matching backend structure
export interface AnalysisResponse {
    score?: number
    matchSkills?: string
    missingSkills?: string
}

export interface CandidateWithApplication {
    id: number
    cvId: number
    candidate: {
        id: number
        email: string
        fullName: string
        phoneNumber: string
        avatarUrl?: string
        isActive: boolean
        role: {
            roleName: "CANDIDATE" | "RECRUITER" | "ADMIN"
        }
        userType: "CANDIDATE" | "RECRUITER" | "ADMIN"
    }
    job: {
        id: number
        title: string
        jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE"
        jobCategory: number
        description: string
        location: string
        skills: string[]
        salary: SalaryDto
        applicationDeadline: string
        numberOfOpenings: number
        company: Company
        recruiterId: string
        status: "OPEN" | "CLOSED" | "EXPIRED"
    }
    status: ApplicationStatus
    appliedDate: string
    coverLetter?: string | null
    analysis?: AnalysisResponse
}

export type Dictionary = {
    [key: string]: string;
};