import { apiClient } from "@/lib/api"
import { CV } from "./types"

/**
 * Download a CV file by its id and trigger a browser download.
 * @param cvId The CV identifier
 * @param fileName The filename to save as (fallbacks to `cv_<id>` if omitted)
 */
export async function downloadCvById(cvId: string, fileName?: string): Promise<void> {
    const blob = await apiClient.downloadCV(cvId)

    // Determine filename
    const downloadName = fileName && fileName.trim().length > 0 ? fileName : `cv_${cvId}`

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}

export async function downloadCv(cv: CV) {
    return downloadCvById(cv.id.toString(), cv.fileName)
}