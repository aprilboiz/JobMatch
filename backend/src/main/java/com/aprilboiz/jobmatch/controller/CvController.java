package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.service.CvService;
import com.aprilboiz.jobmatch.service.MessageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/cvs")
@Tag(name = "CV Management", description = "Operations for managing CVs including upload, retrieval, deletion, and download of resume files")
public class CvController {
    private final MessageService messageService;
    private final CvService cvService;

    public CvController(MessageService messageService, CvService cvService) {
        this.messageService = messageService;
        this.cvService = cvService;
    }

    @Operation(
            summary = "Upload New CV",
            description = """
                    Upload a new CV file for the authenticated candidate.
                    
                    This endpoint allows candidates to upload their resume files in supported formats.
                    The uploaded file will be stored securely and associated with the candidate's profile.
                    
                    **Supported File Formats:**
                    - PDF (.pdf)
                    - Microsoft Word (.doc, .docx)
                    
                    **File Requirements:**
                    - Maximum file size: 10MB
                    - File must contain actual CV content
                    - Only one CV can be active per candidate at a time
                    
                    The uploaded CV can be used when applying for jobs.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "CV uploaded successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid file format, size, or content",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a candidate",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "413",
                    description = "File too large",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CvResponse>> createCv(
            @Parameter(
                    description = "CV file to upload (PDF or Word document)",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestParam("file") MultipartFile file) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Candidate candidate = userPrincipal.getUser().getCandidate();
        if (candidate == null) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }
        CvResponse cvResponse = cvService.createCv(file, candidate);
        String successMessage = messageService.getMessage("api.success.cv.created");
        return ResponseEntity.created(URI.create(cvResponse.getFileUri())).body(ApiResponse.success(successMessage, cvResponse));
    }

    @Operation(
            summary = "Get All CVs for Candidate",
            description = """
                    Retrieve a list of all CVs uploaded by the authenticated candidate.
                    
                    This endpoint returns all CV records associated with the candidate including:
                    - CV ID and filename
                    - Upload date and file size
                    - File type and format
                    - Download URI for accessing the file
                    
                    Results are sorted by upload date (most recent first).
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "CVs retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a candidate",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping()
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<CvResponse>>> getAllCv(@AuthenticationPrincipal UserPrincipal userDetails) {
        Candidate candidate = userDetails.getUser().getCandidate();
        List<CvResponse> cvResponses = cvService.getAllCv(candidate);
        String successMessage = messageService.getMessage("api.success.cv.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, cvResponses));
    }

    @Operation(
            summary = "Get CV Details",
            description = """
                    Retrieve detailed information about a specific CV.
                    
                    This endpoint returns comprehensive CV information including:
                    - CV metadata (filename, size, type)
                    - Upload date and last modified date
                    - File URI for downloading
                    - Associated applications (if any)
                    
                    Only the CV owner (candidate) can access these details.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "CV details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a candidate or not the CV owner",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "CV not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CvResponse>> getCv(
            @Parameter(description = "CV ID", required = true, example = "1")
            @PathVariable Long id) {
        CvResponse cvResponse = cvService.getCv(id);
        String successMessage = messageService.getMessage("api.success.cv.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, cvResponse));
    }

    @Operation(
            summary = "Delete CV",
            description = """
                    Delete a CV file and remove it from the candidate's profile.
                    
                    This endpoint permanently removes the CV file from storage and database.
                    **Warning:** This action cannot be undone.
                    
                    **Deletion Requirements:**
                    - CV must belong to the authenticated candidate
                    - CV should not be associated with pending applications
                    - User must confirm the deletion action
                    
                    After deletion, any applications referencing this CV will show as "CV deleted" status.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "204",
                    description = "CV deleted successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Cannot delete CV (associated with pending applications)",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a candidate or not the CV owner",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "CV not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> deleteCv(
            @Parameter(description = "CV ID to delete", required = true, example = "1")
            @PathVariable Long id) {
        cvService.deleteCv(id);
        String successMessage = messageService.getMessage("api.success.cv.deleted");
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(successMessage, null));
    }

    @Operation(
            summary = "Download CV File",
            description = """
                    Download the actual CV file in its original format.
                    
                    This endpoint serves the CV file for download by authorized users.
                    The file will be streamed with appropriate headers for browser download.
                    
                    **Access Control:**
                    - CV owner (candidate) can always download their own CVs
                    - Recruiters can download CVs from applications to their job postings
                    - Admins have full access to all CVs
                    
                    The response includes proper Content-Disposition headers for file download.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "CV file downloaded successfully",
                    content = @Content(
                            mediaType = "application/octet-stream",
                            schema = @Schema(type = "string", format = "binary")
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - No permission to download this CV",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "CV file not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadCv(
            @Parameter(description = "CV ID to download", required = true, example = "1")
            @PathVariable Long id) {
        Resource resource = cvService.downloadCv(id);
        
        // Handle non-UTF-8 characters in filename using RFC 6266
        String filename = resource.getFilename();
        String encodedFilename;
        try {
            encodedFilename = java.net.URLEncoder.encode(filename, "UTF-8").replace("+", "%20");
        } catch (java.io.UnsupportedEncodingException e) {
            // Fallback to original filename if encoding fails
            encodedFilename = filename;
        }
        
        String contentDisposition = String.format("attachment; filename=\"%s\"; filename*=UTF-8''%s", 
                filename, encodedFilename);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .body(resource);
    }
}
