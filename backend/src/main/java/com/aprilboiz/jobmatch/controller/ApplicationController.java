package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.dto.request.ApplicationRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.service.ApplicationService;
import com.aprilboiz.jobmatch.service.MessageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Application Management", description = "Operations for managing job applications including creating, retrieving, and withdrawing applications")
public class ApplicationController {
    private final ApplicationService applicationService;
    private final MessageService messageService;

    public ApplicationController(ApplicationService applicationService, MessageService messageService) {
        this.applicationService = applicationService;
        this.messageService = messageService;
    }

    @Operation(
            summary = "Get All Applications for Candidate",
            description = """
                    Retrieve a paginated list of all job applications submitted by the authenticated candidate.
                    
                    This endpoint returns applications with basic information including:
                    - Application ID and submission date
                    - Job title and company name
                    - Application status
                    - CV used for the application
                    
                    Results are sorted by creation date (most recent first) by default.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Applications retrieved successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a candidate"
            )
    })
    @GetMapping()
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getAllApplications(
            @Parameter(description = "Pagination parameters") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        Candidate candidate = userDetails.getUser().getCandidate();
        if (candidate == null) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }
        PageRequest pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt")));
        Page<ApplicationResponse> applicationResponses = applicationService.getAllApplications(candidate, pageRequest);
        String successMessage = messageService.getMessage("api.success.applications.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, applicationResponses));
    }

    @Operation(
            summary = "Get Application Details",
            description = """
                    Retrieve detailed information about a specific job application.
                    
                    This endpoint returns comprehensive application details including:
                    - Complete job information
                    - Application status and submission date
                    - CV details used for the application
                    - Any additional notes or comments
                    
                    Only the candidate who submitted the application can access these details.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Application details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a candidate or not the application owner",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Application not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getApplication(
            @Parameter(description = "Application ID", required = true, example = "1")
            @PathVariable Long id) {
        ApplicationDetailResponse applicationResponse = applicationService.getApplication(id);
        String successMessage = messageService.getMessage("api.success.application.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, applicationResponse));
    }

    @Operation(
            summary = "Submit Job Application",
            description = """
                    Submit a new job application for a specific job posting.
                    
                    This endpoint allows candidates to apply for jobs by providing:
                    - Job ID to apply for
                    - CV ID to use for the application
                    - Optional cover letter or additional notes
                    
                    Requirements:
                    - User must have a candidate profile
                    - Job must be active and accepting applications
                    - Candidate cannot apply for the same job twice
                    - CV must belong to the candidate
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Application submitted successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data or duplicate application",
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
                    responseCode = "404",
                    description = "Job or CV not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping()
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> createApplication(
            @Parameter(description = "Application request data", required = true)
            @RequestBody @Valid ApplicationRequest applicationRequest,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        Candidate candidate = userDetails.getUser().getCandidate();
        if (candidate == null) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }
        ApplicationResponse applicationResponse = applicationService.createApplication(applicationRequest);
        String successMessage = messageService.getMessage("api.success.application.created");
        return ResponseEntity.created(URI.create("/api/applications/" + applicationResponse.getId()))
                .body(ApiResponse.success(successMessage, applicationResponse));
    }

    @Operation(
            summary = "Withdraw Job Application",
            description = """
                    Withdraw a previously submitted job application.
                    
                    This endpoint allows candidates to withdraw their applications if:
                    - The application is still pending (not yet processed)
                    - The application deadline has not passed
                    - The candidate is the owner of the application
                    
                    Once withdrawn, the application status will be updated and cannot be undone.
                    The candidate can submit a new application if the job is still accepting applications.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "204",
                    description = "Application withdrawn successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Cannot withdraw application (already processed or deadline passed)",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a candidate or not the application owner",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Application not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
            @Parameter(description = "Application ID to withdraw", required = true, example = "1")
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        applicationService.withdrawApplication(id, userDetails.getUser().getCandidate());
        String successMessage = messageService.getMessage("api.success.application.withdrawn");
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(successMessage, null));
    }
}
