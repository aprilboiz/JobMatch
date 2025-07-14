"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, Trash2, Download, Eye, Brain, TrendingUp } from "lucide-react"
import { apiClient } from "@/lib/api"
import { CV } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { downloadCv } from "@/lib/cv-utils"
import { t } from '@/lib/i18n-client'

type Dictionary = {
  [key: string]: string;
};

interface CVManagerProps {
  locale: string;
  dictionary: Dictionary;
}

export function CVManager({ locale, dictionary }: CVManagerProps) {
  const [cvs, setCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [analyzingCvId, setAnalyzingCvId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCVs()
  }, [])

  const loadCVs = async () => {
    try {
      const response = await apiClient.getCVs()
      if (response.success) {
        setCvs(response.data)
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(dictionary, "error.title"),
        description: t(dictionary, "cv.uploadError"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: t(dictionary, "cv.invalidType"),
        description: t(dictionary, "cv.invalidTypeDesc"),
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: t(dictionary, "cv.fileTooLarge"),
        description: t(dictionary, "cv.fileTooLargeDesc"),
      })
      return
    }

    setIsUploading(true)
    try {
      await apiClient.uploadCV(file)
      await loadCVs()
      toast({
        title: t(dictionary, "cv.uploadSuccess"),
        description: t(dictionary, "cv.uploadSuccessDesc"),
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        variant: "destructive",
        title: t(dictionary, "cv.uploadError"),
        description: error instanceof Error ? error.message : t(dictionary, "cv.uploadErrorDesc"),
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const handleDeleteCV = async (cvId: string) => {
    try {
      await apiClient.deleteCV(cvId)
      setCvs((prev) => prev.filter((cv) => cv.id !== cvId))
      toast({
        title: t(dictionary, "cv.deleteSuccess"),
        description: t(dictionary, "cv.deleteSuccessDesc"),
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(dictionary, "cv.deleteError"),
        description: t(dictionary, "cv.deleteErrorDesc"),
      })
    }
  }

  const handleAnalyzeCV = async (cvId: string) => {
    setAnalyzingCvId(cvId)
    try {
      const response = await apiClient.analyzeCV(cvId)
      if (response.success) {
        setCvs((prev) => prev.map((cv) => (cv.id === cvId ? { ...cv, aiAnalysis: response.data } : cv)))
        toast({
          title: t(dictionary, "cv.analyzeSuccess"),
          description: response.message || t(dictionary, "cv.analyzeSuccessDesc"),
        })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(dictionary, "cv.analyzeError"),
        description: t(dictionary, "cv.analyzeErrorDesc"),
      })
    } finally {
      setAnalyzingCvId(null)
    }
  }

  const handleDownloadCV = async (cv: CV) => {
    try {
      await downloadCv(cv)
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(dictionary, "cv.downloadError"),
        description: t(dictionary, "cv.downloadErrorDesc"),
      })
    }
  }

  const handleViewCV = async (cv: CV) => {
    try {
      const fileExtension = cv.fileName.toLowerCase().split('.').pop()

      // For .docx files, use Microsoft Office online viewer
      if (fileExtension === 'docx' || fileExtension === 'doc') {
        // First try to get the blob to ensure the file exists and user has access
        await apiClient.downloadCV(cv.id)

        // Use Microsoft Office online viewer
        const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cv.fileUrl)}`
        window.open(viewerUrl, "_blank")
        return
      }

      // For PDF and other files, create blob with proper MIME type
      const blob = await apiClient.downloadCV(cv.id)

      // Set the correct MIME type based on file extension
      let mimeType = blob.type
      if (!mimeType || mimeType === 'application/octet-stream') {
        switch (fileExtension) {
          case 'pdf':
            mimeType = 'application/pdf'
            break
          case 'doc':
            mimeType = 'application/msword'
            break
          case 'docx':
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            break
          default:
            mimeType = blob.type
        }
      }

      // Create blob with correct MIME type
      const typedBlob = new Blob([blob], { type: mimeType })
      const url = window.URL.createObjectURL(typedBlob)
      window.open(url, "_blank")

      // Revoke the object URL after some time
      setTimeout(() => window.URL.revokeObjectURL(url), 10000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: t(dictionary, "cv.viewError"),
        description: t(dictionary, "cv.viewErrorDesc"),
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t(dictionary, "cv.excellent")
    if (score >= 60) return t(dictionary, "cv.good")
    if (score >= 40) return t(dictionary, "cv.average")
    return t(dictionary, "cv.needsImprovement")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-primary" />
            {t(dictionary, "cv.upload")}
          </CardTitle>
          <CardDescription>{t(dictionary, "cv.supportedFormats")} - {t(dictionary, "cv.maxSize")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="cv-upload"
              disabled={isUploading}
            />
            <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isUploading ? t(dictionary, "profile.uploading") : t(dictionary, "cv.dropFile")}
              </span>
              <span className="text-xs text-muted-foreground">{t(dictionary, "cv.supportedFormats")}</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* CVs List */}
      <Card>
        <CardHeader>
          <CardTitle>{t(dictionary, "cv.manager")} ({cvs.length})</CardTitle>
          <CardDescription>{t(dictionary, "cv.analysis")}</CardDescription>
        </CardHeader>
        <CardContent>
          {cvs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t(dictionary, "cv.noCV")}</p>
              <p className="text-sm text-muted-foreground">{t(dictionary, "cv.uploadFirst")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cvs.map((cv) => (
                <Card key={cv.id} className="hover:shadow-md transition-shadow hover:cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{cv.fileName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{formatFileSize(cv.fileSize)}</span>
                            <span>{t(dictionary, "cv.uploadDate")}: {new Date(cv.updatedAt).toLocaleDateString()}</span>
                          </div>

                          {/* AI Analysis */}
                          {cv.aiAnalysis && (
                            <>
                              <Separator className="my-3" />
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Brain className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-medium">{t(dictionary, "cv.aiAnalysis")}</span>
                                  <Badge variant={getScoreBadgeVariant(cv.aiAnalysis.score)} className="text-xs">
                                    {t(dictionary, "cv.score")}: {cv.aiAnalysis.score}/100
                                  </Badge>
                                </div>
                                <Progress value={cv.aiAnalysis.score} className="h-2" />
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="font-medium">{t(dictionary, "cv.skills")}:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {cv.aiAnalysis.skills.slice(0, 3).map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {cv.aiAnalysis.skills.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{cv.aiAnalysis.skills.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">{t(dictionary, "cv.experience")}:</span>
                                    <p className="text-muted-foreground mt-1 line-clamp-2">
                                      {cv.aiAnalysis.experience}
                                    </p>
                                  </div>
                                </div>
                                {cv.aiAnalysis.recommendations.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs font-medium">{t(dictionary, "cv.recommendations")}:</span>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {cv.aiAnalysis.recommendations[0]}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!cv.aiAnalysis && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnalyzeCV(cv.id)}
                            disabled={analyzingCvId === cv.id}
                            className="text-purple-600 border-purple-600 hover:bg-purple-50"
                          >
                            {analyzingCvId === cv.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-1"></div>
                                {t(dictionary, "cv.analyzing")}
                              </>
                            ) : (
                              <>
                                <Brain className="w-3 h-3 mr-1" />
                                {t(dictionary, "cv.analyze")}
                              </>
                            )}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleViewCV(cv)}>
                          <Eye className="w-3 h-3 mr-1" />
                          {t(dictionary, "cv.view")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadCV(cv)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          {t(dictionary, "cv.download")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCV(cv.id)}
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Summary */}
      {cvs.some((cv) => cv.aiAnalysis) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              {t(dictionary, "cv.aiAnalysis")} - {t(dictionary, "dashboard.overview")}
            </CardTitle>
            <CardDescription>{t(dictionary, "cv.analysis")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(
                    cvs.filter((cv) => cv.aiAnalysis).reduce((acc, cv) => acc + (cv.aiAnalysis?.score || 0), 0) /
                    cvs.filter((cv) => cv.aiAnalysis).length,
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{t(dictionary, "cv.score")} {t(dictionary, "dashboard.overview")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cvs.filter((cv) => cv.aiAnalysis && cv.aiAnalysis.score >= 80).length}
                </div>
                <div className="text-sm text-muted-foreground">{t(dictionary, "cv.excellent")} CVs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Array.from(new Set(cvs.flatMap((cv) => cv.aiAnalysis?.skills || []))).length}
                </div>
                <div className="text-sm text-muted-foreground">{t(dictionary, "cv.skills")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
