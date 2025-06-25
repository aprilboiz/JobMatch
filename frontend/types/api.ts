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

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  isActive: boolean;
  role: {
    roleName: string;
  };
  userType: string;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber: string;
}

// Recruiter profile update request (simplified)
export interface UpdateRecruiterProfileRequest {
  fullName: string;
  phoneNumber: string;
  companyId: number;
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

// Application Types (Updated to match backend exactly)
export interface ApplicationResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: string;
  appliedOn: string;
}

// Detailed application response (when candidate details are included)
export interface ApplicationDetailResponse extends ApplicationResponse {
  candidateName: string;
  candidateEmail: string;
  candidatePhoneNumber: string;
  cvFileName?: string;
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

export interface JobResponse {
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

export interface JobRequest {
  title: string;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE";
  description: string;
  location: string;
  salary: SalaryDto;
  applicationDeadline: string; // LocalDate from backend (YYYY-MM-DD)
  numberOfOpenings: number;
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
  logoUrl?: string;
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
