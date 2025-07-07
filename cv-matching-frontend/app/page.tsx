"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Upload,
  FileText,
  Briefcase,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";

// Types
interface MatchingResult {
  similarity_score: number;
  match_score?: number;
  doc2vec_similarity?: number;
  sbert_similarity?: number;
  recommendation: string;
  method_used: string;
  confidence_level: string;
  method_reliability: string;
}

interface FileUploadResult {
  filename: string;
  file_size: number;
  file_type: string;
  extracted_text: string;
  word_count: number;
  processing_success: boolean;
  error_message?: string;
}

const API_BASE_URL = "http://localhost:8000";

export default function Home() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [error, setError] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");

  // Handle file upload
  const handleFileUpload = (file: File, type: "cv" | "jd") => {
    if (type === "cv") {
      setCvFile(file);
    } else {
      setJdFile(file);
    }
  };

  // Extract text from uploaded files
  const extractTextFromFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post<FileUploadResult>(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.processing_success) {
        return response.data.extracted_text;
      } else {
        throw new Error(
          response.data.error_message || "Failed to extract text"
        );
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      throw error;
    }
  };

  // Match CV and JD
  const handleMatch = async () => {
    if (uploadMode === "file" && (!cvFile || !jdFile)) {
      setError("Please upload both CV and Job Description files");
      return;
    }

    if (uploadMode === "text" && (!cvText.trim() || !jdText.trim())) {
      setError("Please enter both CV and Job Description text");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      let finalCvText = "";
      let finalJdText = "";

      if (uploadMode === "file") {
        // Extract text from files
        finalCvText = await extractTextFromFile(cvFile!);
        finalJdText = await extractTextFromFile(jdFile!);
      } else {
        finalCvText = cvText;
        finalJdText = jdText;
      }

      // Send matching request
      const matchResponse = await axios.post<MatchingResult>(
        `${API_BASE_URL}/match`,
        {
          cv_text: finalCvText,
          jd_text: finalJdText,
          method: "both",
        }
      );

      setResult(matchResponse.data);
    } catch (error) {
      console.error("Error matching:", error);
      setError("Failed to match CV and JD. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get score color based on percentage
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  // Get confidence badge color
  const getConfidenceColor = (confidence: string) => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤖 CV Job Matching AI
          </h1>
          <p className="text-gray-600">
            Upload your CV and Job Description to get AI-powered matching score
          </p>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => setUploadMode("file")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                uploadMode === "file"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📁 File Upload
            </button>
            <button
              onClick={() => setUploadMode("text")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                uploadMode === "text"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📝 Text Input
            </button>
          </div>
        </div>

        {/* File Upload Mode */}
        {uploadMode === "file" && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* CV Upload */}
            <div className="bg-white rounded-lg shadow-md p-6 file-upload-container">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Upload CV
                </h3>
                <p className="text-gray-600 mb-4">
                  PDF, DOCX, DOC, TXT supported
                </p>

                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files[0], "cv")
                  }
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose CV File
                </label>

                {cvFile && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-700 font-medium">
                        {cvFile.name}
                      </span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      {(cvFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* JD Upload */}
            <div className="bg-white rounded-lg shadow-md p-6 file-upload-container">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Upload Job Description
                </h3>
                <p className="text-gray-600 mb-4">
                  PDF, DOCX, DOC, TXT supported
                </p>

                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files[0], "jd")
                  }
                  className="hidden"
                  id="jd-upload"
                />
                <label
                  htmlFor="jd-upload"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose JD File
                </label>

                {jdFile && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-700 font-medium">
                        {jdFile.name}
                      </span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      {(jdFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Text Input Mode */}
        {uploadMode === "text" && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* CV Text */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                CV Text
              </h3>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV content here..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* JD Text */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                Job Description Text
              </h3>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* Match Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleMatch}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Get Matching Score
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🎯 Matching Results
            </h2>

            {/* Main Score */}
            <div className="text-center mb-6">
              <div className="inline-block">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <div
                    className="w-full h-full rounded-full border-8 border-gray-200 relative"
                    style={{
                      background: `conic-gradient(from 0deg, #22c55e 0deg, #22c55e ${
                        result.similarity_score * 3.6
                      }deg, #e5e7eb ${
                        result.similarity_score * 3.6
                      }deg, #e5e7eb 360deg)`,
                    }}
                  >
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <span
                        className={`text-3xl font-bold ${getScoreColor(
                          result.similarity_score
                        )}`}
                      >
                        {result.similarity_score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium">Overall Match Score</p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="text-center mb-6">
              <div className="inline-block bg-blue-50 rounded-lg p-4">
                <p className="text-lg font-semibold text-blue-800">
                  {result.recommendation}
                </p>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {result.doc2vec_similarity && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Doc2Vec Score
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.doc2vec_similarity.toFixed(1)}%
                  </p>
                </div>
              )}

              {result.sbert_similarity && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    SBERT Score
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {result.sbert_similarity.toFixed(1)}%
                  </p>
                </div>
              )}

              {result.match_score && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    ML Score
                  </h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {result.match_score.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="border-t pt-4">
              <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">Confidence:</span>
                  <span
                    className={`px-2 py-1 rounded ${getConfidenceColor(
                      result.confidence_level
                    )}`}
                  >
                    {result.confidence_level.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="font-medium mr-2">Method:</span>
                  <span>{result.method_used}</span>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Analysis:</span>{" "}
                  {result.method_reliability}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
