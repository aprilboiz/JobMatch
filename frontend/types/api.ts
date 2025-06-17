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
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";
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
  user?: User;
}

// User Types
export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string; // Changed from phone to phoneNumber
  role: {
    roleName: string;
  };
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string; // Changed from phone to phoneNumber
  location?: string;
  summary?: string;
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

// Job Types
export interface Job {
  id: number;
  title: string;
  company: string;
  department: string;
  location: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE";
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  skills: string[];
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  postedAt: string;
  deadline: string;
  applicants: number;
  views: number;
}

export interface CreateJobRequest {
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  skills: string[];
  deadline: string;
}
