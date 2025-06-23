// Authentication Types (Updated to match backend)
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string; // Changed from phone to phoneNumber
  password: string;
  role: "CANDIDATE" | "RECRUITER" | "ADMIN"; // Added role field
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// User Types
export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string; // Changed from phone to phoneNumber
  isActive?: boolean;
  userType?: string;
  role: {
    roleName: string;
  };
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber: string;
}

// CV Types (Updated to match backend)
export interface CvResponse {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileUri: string;
  uploadedAt: string;
  contentType: string;
}

// Application Types (Updated to match backend)
export interface ApplicationResponse {
  id: number;
  jobId: number;
  candidateId: number;
  status: "PENDING" | "REVIEWING" | "INTERVIEW" | "REJECTED" | "ACCEPTED";
  appliedAt: string;
  matchScore?: number;
  notes?: string;
  interviewDate?: string;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
  };
}

// API Response wrapper (matching backend ApiResponse)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Job Types (Updated to match backend exactly)
export interface SalaryDto {
  salaryType: "FIXED" | "RANGE" | "NEGOTIABLE" | "COMPETITIVE";
  minSalary?: number;
  maxSalary?: number;
  currency?: "USD" | "VND" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD";
  salaryPeriod?: "ANNUAL" | "MONTHLY" | "WEEKLY" | "HOURLY";
}

export interface Job {
  id: number;
  title: string;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE";
  description: string;
  location: string;
  salary: SalaryDto;
  applicationDeadline: string; // LocalDate from backend (YYYY-MM-DD)
  numberOfOpenings: number;
  companyId: string;
  recruiterId: string;
  status: "OPEN" | "CLOSED" | "EXPIRED";
}

export interface CreateJobRequest {
  title: string;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE";
  salary: SalaryDto;
  openings: number;
  applicationDeadline: string; // LocalDate format YYYY-MM-DD
  description: string;
  location: string;
}

// Company Types (Based on backend CompanyResponse and CompanyRequest)
export interface CompanyResponse {
  id: number;
  name: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  address: string;
  companySize: string;
  industry: string;
  description?: string;
}

export interface CompanyRequest {
  name: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  address: string;
  companySize: string;
  industry: string;
  description?: string;
}
