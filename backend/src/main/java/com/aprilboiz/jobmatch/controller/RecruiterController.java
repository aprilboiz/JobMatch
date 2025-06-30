package com.aprilboiz.jobmatch.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aprilboiz.jobmatch.dto.request.CompanyRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.dto.response.JobResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.model.UserPrincipalAdapter;
import com.aprilboiz.jobmatch.service.ApplicationService;
import com.aprilboiz.jobmatch.service.CompanyService;
import com.aprilboiz.jobmatch.service.JobService;
import com.aprilboiz.jobmatch.service.MessageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/me")
@PreAuthorize("hasRole('RECRUITER')")
@Tag(name = "Recruiter Management", description = "Operations for recruiters to manage their job postings, company profile, and recruitment activities")
public class RecruiterController {
    private final JobService jobService;
    private final MessageService messageService;
    private final CompanyService companyService;
    private final ApplicationService applicationService;

    public RecruiterController(JobService jobService, MessageService messageService, CompanyService companyService, ApplicationService applicationService) {
        this.jobService = jobService;
        this.messageService = messageService;
        this.companyService = companyService;
        this.applicationService = applicationService;
    }

    @Operation(
            summary = "Get Jobs Posted by Recruiter",
            description = """
                    Retrieve a paginated list of all job postings created by the authenticated recruiter.
                    
                    This endpoint returns jobs with comprehensive information including:
                    - Job details (title, description, requirements)
                    - Application statistics (total applications, pending, reviewed)
                    - Job status and performance metrics
                    - Company and location information
                    
                    Results are sorted by creation date (most recent first) by default.
                    Only accessible to users with RECRUITER role.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Jobs retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a recruiter",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getRecruiterJobs(
            @Parameter(description = "Pagination parameters") Pageable pageable)
    {
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter recruiter)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }
        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        String successMessage = messageService.getMessage("api.success.jobs.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, jobService.getJobsByRecruiter(recruiter, pageRequest)));
    }

    @Operation(
            summary = "Update Company Profile",
            description = """
                    Update the company profile information as a recruiter.
                    
                    This endpoint allows authenticated recruiters to modify their company's information:
                    - Company name and description
                    - Contact information (website, phone, email)
                    - Company size and industry classification
                    - Address and location details
                    
                    Only recruiters associated with the company can make these updates.
                    Changes are immediately reflected across all job postings and public company profile.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Company profile updated successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not authorized to update this company",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PutMapping("/company")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<Void>> updateCompanyProfile(
            @Parameter(description = "Company update request data", required = true)
            @RequestBody @Valid CompanyRequest request)
    {
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter recruiter)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }
        Company company = recruiter.getCompany();
        if (company == null) {
            companyService.createCompany(request);
        } else {
            companyService.updateCompany(company.getId(), request);
        }
        String successMessage = messageService.getMessage("api.success.recruiter.profile.updated");
        return ResponseEntity.ok(ApiResponse.success(successMessage, null));
    }

    @Operation(
            summary = "Get Application Details (Recruiter View)",
            description = """
                    Retrieve detailed information about a specific job application from recruiter perspective.
                    
                    This endpoint provides comprehensive application data including:
                    - Candidate profile and contact information
                    - CV/resume details and download links
                    - Application status and submission timeline
                    - Interview notes and recruitment progress
                    
                    Only recruiters who posted the job can access application details.
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
    @GetMapping("/applications/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getApplicationForRecruiter(
            @Parameter(description = "Application ID", required = true, example = "1")
            @PathVariable Long id) {
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter recruiter)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        ApplicationDetailResponse applicationResponse = applicationService.getApplication(id, recruiter);
        String successMessage = messageService.getMessage("api.success.application.detail.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, applicationResponse));
    }
}
