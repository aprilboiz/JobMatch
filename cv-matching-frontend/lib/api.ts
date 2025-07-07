import axios from "axios";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface MatchingResult {
  similarity_score: number;
  match_score?: number;
  doc2vec_similarity?: number;
  sbert_similarity?: number;
  recommendation: string;
  method_used: string;
  confidence_level: string;
  method_reliability: string;
}

export interface FileUploadResult {
  filename: string;
  file_size: number;
  file_type: string;
  extracted_text: string;
  word_count: number;
  processing_success: boolean;
  error_message?: string;
}

export interface HealthCheckResult {
  status: string;
  doc2vec_model: boolean;
  sbert_model: boolean;
  lr_model: boolean;
}

export interface DependenciesResult {
  status: string;
  dependencies: {
    pdf_support: boolean;
    docx_support: boolean;
    doc_support: boolean;
    supported_formats: string[];
  };
  recommendations: {
    pdf: string;
    docx: string;
    doc: string;
  };
}

// API Functions
export const api = {
  // Health check
  async healthCheck(): Promise<HealthCheckResult> {
    const response = await apiClient.get("/health");
    return response.data;
  },

  // Check dependencies
  async checkDependencies(): Promise<DependenciesResult> {
    const response = await apiClient.get("/dependencies");
    return response.data;
  },

  // Upload file and extract text
  async uploadFile(file: File): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Match CV and JD with text input
  async matchTexts(
    cvText: string,
    jdText: string,
    method: string = "both"
  ): Promise<MatchingResult> {
    const response = await apiClient.post("/match", {
      cv_text: cvText,
      jd_text: jdText,
      method: method,
    });

    return response.data;
  },

  // Match CV and JD with file upload
  async matchFiles(
    cvFile?: File,
    jdFile?: File,
    cvText?: string,
    jdText?: string,
    method: string = "both"
  ): Promise<MatchingResult> {
    const formData = new FormData();

    if (cvFile) formData.append("cv_file", cvFile);
    if (jdFile) formData.append("jd_file", jdFile);
    if (cvText) formData.append("cv_text", cvText);
    if (jdText) formData.append("jd_text", jdText);
    formData.append("method", method);

    const response = await apiClient.post("/match-files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Analyze matching (detailed analysis)
  async analyzeMatching(
    cvText: string,
    jdText: string,
    method: string = "both"
  ): Promise<any> {
    const response = await apiClient.post("/analyze", {
      cv_text: cvText,
      jd_text: jdText,
      method: method,
    });

    return response.data;
  },
};

// Utility functions
export const utils = {
  // Get score color based on percentage
  getScoreColor(score: number): string {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  },

  // Get score background color
  getScoreBgColor(score: number): string {
    if (score >= 70) return "bg-green-50";
    if (score >= 50) return "bg-yellow-50";
    return "bg-red-50";
  },

  // Get confidence badge color
  getConfidenceColor(confidence: string): string {
    switch (confidence.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Validate file type
  isValidFileType(file: File): boolean {
    const validTypes = [".pdf", ".docx", ".doc", ".txt"];
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    return validTypes.includes(extension);
  },

  // Get recommendation emoji
  getRecommendationEmoji(score: number): string {
    if (score >= 90) return "🌟";
    if (score >= 70) return "✅";
    if (score >= 50) return "⚠️";
    return "❌";
  },

  // Format method name
  formatMethodName(method: string): string {
    const methodMap: { [key: string]: string } = {
      doc2vec: "Doc2Vec",
      sbert: "SentenceTransformer",
      both: "Combined",
      sbert_prioritized: "SBERT Prioritized",
    };
    return methodMap[method] || method;
  },
};

// Error handling
export class APIError extends Error {
  constructor(message: string, public status?: number, public response?: any) {
    super(message);
    this.name = "APIError";
  }
}

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      throw new APIError(
        error.response.data.detail ||
          error.response.data.message ||
          "API Error",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // Network error
      throw new APIError(
        "Network error. Please check if the API server is running."
      );
    } else {
      // Something else happened
      throw new APIError(error.message || "Unknown error occurred");
    }
  }
);

export default api;
