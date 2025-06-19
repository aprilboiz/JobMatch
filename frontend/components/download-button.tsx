import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { candidateApi } from "@/lib/api/candidate"
import { useToast } from "@/hooks/use-toast"

interface DownloadButtonProps {
  cvId: number
  className?: string
  children?: React.ReactNode
}

export function DownloadButton({ cvId, className, children }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Option 1: Download and save directly
      await candidateApi.downloadAndSaveCV(cvId)
      
      toast({
        title: "Success",
        description: "CV downloaded successfully",
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Error",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Alternative approach: Get download data first, then trigger download
  const handleDownloadWithPreview = async () => {
    try {
      setIsDownloading(true)
      
      // Get the download response
      const { blob, filename, contentType } = await candidateApi.downloadCV(cvId)
      
      // You can do something with the blob before downloading
      console.log(`Downloading ${filename} (${contentType})`)
      console.log(`File size: ${blob.size} bytes`)
      
      // Trigger the download
      const { triggerFileDownload } = await import("@/lib/utils/file-download")
      triggerFileDownload(blob, filename)
      
      toast({
        title: "Success",
        description: `Downloaded ${filename}`,
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Error",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
      variant="outline"
      size="sm"
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {children || "Download CV"}
        </>
      )}
    </Button>
  )
}

// Example usage in a CV list component
export function CVListExample() {
  const cvs = [
    { id: 1, filename: "john-doe-cv.pdf" },
    { id: 2, filename: "jane-smith-cv.pdf" },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your CVs</h2>
      {cvs.map((cv) => (
        <div key={cv.id} className="flex items-center justify-between p-4 border rounded-lg">
          <span className="font-medium">{cv.filename}</span>
          <DownloadButton cvId={cv.id} />
        </div>
      ))}
    </div>
  )
}
