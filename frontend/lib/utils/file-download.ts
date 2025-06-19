/**
 * Utility functions for handling file downloads
 */

export interface DownloadResponse {
  blob: Blob;
  filename: string;
  contentType?: string;
}

/**
 * Extract filename from Content-Disposition header
 */
export function extractFilenameFromHeader(
  contentDisposition: string
): string | null {
  if (!contentDisposition) return null;

  console.log("Content-Disposition header:", contentDisposition);

  // Try different patterns for filename extraction
  const patterns = [
    /filename\*=UTF-8''([^;]+)/i, // RFC 5987 encoded filename
    /filename\*=([^;]+)/i, // Other encoded filename
    /filename="([^"]+)"/i, // Quoted filename
    /filename=([^;,\s]+)/i, // Unquoted filename (improved pattern)
  ];

  for (const pattern of patterns) {
    const match = contentDisposition.match(pattern);
    if (match) {
      let filename = match[1];
      console.log(`Matched pattern: ${pattern.source}, filename: ${filename}`);

      // Decode URI component if it's encoded
      try {
        filename = decodeURIComponent(filename);
      } catch {
        // If decoding fails, use as is
      }
      return filename.trim();
    }
  }

  console.log("No filename pattern matched");
  return null;
}

/**
 * Trigger file download in browser
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined") {
    console.warn("triggerFileDownload called in non-browser environment");
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  window.URL.revokeObjectURL(url);
}

/**
 * Download file from API response with proper filename handling
 */
export async function downloadFromResponse(
  response: Response,
  defaultFilename: string = "download"
): Promise<DownloadResponse> {
  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`
    );
  }

  // Debug: Log all response headers
  console.log("=== RESPONSE HEADERS DEBUG ===");
  console.log("Response status:", response.status);
  console.log("Response URL:", response.url);

  // Log all headers
  const allHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    allHeaders[key] = value;
    console.log(`${key}: ${value}`);
  });

  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers.get("content-disposition");
  const contentType = response.headers.get("content-type");

  console.log("=== SPECIFIC HEADERS ===");
  console.log("Content-Disposition:", contentDisposition);
  console.log("Content-Type:", contentType);
  console.log(
    "Access-Control-Expose-Headers:",
    response.headers.get("access-control-expose-headers")
  );

  let filename = defaultFilename;
  if (contentDisposition) {
    const extractedFilename = extractFilenameFromHeader(contentDisposition);
    if (extractedFilename) {
      filename = extractedFilename;
      console.log("Using extracted filename:", filename);
    } else {
      console.log("Could not extract filename, using default:", filename);
    }
  } else {
    console.log(
      "No Content-Disposition header found, using default:",
      filename
    );
  }

  const blob = await response.blob();

  return {
    blob,
    filename,
    contentType: contentType || undefined,
  };
}

/**
 * Generic API download function with authentication
 */
export async function downloadFile(
  url: string,
  defaultFilename: string = "download",
  headers: Record<string, string> = {}
): Promise<DownloadResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...headers,
    },
  });

  return downloadFromResponse(response, defaultFilename);
}

/**
 * Download and save file with one function call
 */
export async function downloadAndSave(
  url: string,
  defaultFilename: string = "download",
  headers: Record<string, string> = {}
): Promise<void> {
  const { blob, filename } = await downloadFile(url, defaultFilename, headers);
  triggerFileDownload(blob, filename);
}
