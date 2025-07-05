package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.dto.request.ApplicationRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.enumerate.ApplicationStatus;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.UserPrincipalAdapter;
import com.aprilboiz.jobmatch.model.User;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Application Management", description = "Operations for candidates to manage their job applications")
public class ApplicationController {
    private final ApplicationService applicationService;
    private final MessageService messageService;

    public ApplicationController(ApplicationService applicationService, MessageService messageService) {
        this.applicationService = applicationService;
        this.messageService = messageService;
    }

    @Operation(
            summary = "Get All User Applications",
            description = """
                    Retrieve a paginated list of all job applications submitted by the authenticated candidate.
                   
                    Only accessible to users with CANDIDATE role.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Applications retrieved successfully",
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
    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Page<ApplicationDetailResponse>>> getAllApplications(
            @Parameter(description = "Pagination parameters") Pageable pageable,
            @AuthenticationPrincipal UserPrincipalAdapter userDetails) {
        User user = userDetails.getUser();
        if (!(user instanceof Candidate candidate)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }
        PageRequest pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt")));
        Page<ApplicationDetailResponse> applicationResponses = applicationService.getAllApplications(candidate, pageRequest);
        String successMessage = messageService.getMessage("api.success.applications.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, applicationResponses));
    }

    @Operation(
            summary = "Get Application Details",
            description = """
                    Retrieve detailed information about a specific job application.
                    
                    This endpoint returns comprehensive application data including:
                    - Complete application timeline and status history
                    - Job posting details and requirements
                    - Candidate information and submitted materials
                    - Recruiter notes and feedback (if available)
                    
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
                    responseCode = "404",
                    description = "Application not found or access denied",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getApplication(
            @Parameter(description = "Application ID", required = true, example = "1")
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipalAdapter userDetails) {
        User user = userDetails.getUser();
        if (!(user instanceof Candidate candidate)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }
        ApplicationDetailResponse applicationResponse = applicationService.getApplication(id, candidate);
        String successMessage = messageService.getMessage("api.success.application.detail.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, applicationResponse));
    }

    @Operation(
            summary = "Submit Job Application",
            description = """
                    Submit a new job application for a specific position.
                    
                    This endpoint allows candidates to apply for jobs by:
                    - Selecting a job posting to apply for
                    - Choosing which CV/resume to submit
                    - Adding optional cover letter or notes
                    
                    **Requirements:**
                    - Must be authenticated as a candidate
                    - Job must be currently accepting applications
                    - Cannot apply for the same job twice
                    - Must have at least one CV uploaded
                    
                    Upon successful submission, the application enters "PENDING" status
                    and recruiters are notified of the new application.
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
                    responseCode = "409",
                    description = "Duplicate application or job no longer accepting applications",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> createApplication(
            @Parameter(description = "Application request data", required = true)
            @RequestBody @Valid ApplicationRequest applicationRequest,
            @AuthenticationPrincipal UserPrincipalAdapter userDetails) {
        User user = userDetails.getUser();
        if (!(user instanceof Candidate candidate)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }
        ApplicationResponse applicationResponse = applicationService.createApplication(applicationRequest, candidate);
        String successMessage = messageService.getMessage("api.success.created", "Application");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(successMessage, applicationResponse));
    }

    @Operation(
            summary = "Withdraw Application",
            description = """
                    Withdraw a previously submitted job application.
                    
                    This action:
                    - Changes application status to "WITHDRAWN"
                    - Notifies the recruiter of the withdrawal
                    - Cannot be undone - candidates must reapply if desired
                    
                    **Restrictions:**
                    - Can only withdraw your own applications
                    - Cannot withdraw applications that are already processed (ACCEPTED/REJECTED)
                    - Cannot withdraw applications after certain deadlines (company-specific)
                    
                    Use this feature if you're no longer interested in the position
                    or have accepted another offer.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Application withdrawn successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Application not found or cannot be withdrawn",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "Application cannot be withdrawn in current status",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
            @Parameter(description = "Application ID to withdraw", required = true, example = "1")
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipalAdapter userDetails) {
        User user = userDetails.getUser();
        if (!(user instanceof Candidate candidate)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }
        applicationService.withdrawApplication(id, candidate);
        String successMessage = messageService.getMessage("api.success.application.withdrawn");
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(successMessage, null));
    }

    @Operation(
            summary = "Update Application Status",
            description = """
                    Update the status of a job application during the recruitment process.
                    
                    This endpoint allows recruiters to manage application workflow:
                    - Move applications through review stages (APPLIED → IN_REVIEW → INTERVIEW)
                    - Make final decisions (OFFERED or REJECTED)
                    - Track recruitment progress and candidate pipeline
                    
                    **Status Transition Rules:**
                    - APPLIED → IN_REVIEW or REJECTED
                    - IN_REVIEW → INTERVIEW or REJECTED
                    - INTERVIEW → OFFERED or REJECTED
                    - OFFERED and REJECTED are final states
                    
                    Only the recruiter who posted the job can update application status.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Application status updated successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid status transition",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Application not found or access denied",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> updateApplicationStatus(
            @Parameter(description = "Application ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(description = "New application status", required = true)
            @RequestParam ApplicationStatus status) {
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter recruiter)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        ApplicationDetailResponse applicationResponse = applicationService.updateApplicationStatus(id, status, recruiter);
        String successMessage = messageService.getMessage("api.success.application.status.updated");
        return ResponseEntity.ok(ApiResponse.success(successMessage, applicationResponse));
    }
}
