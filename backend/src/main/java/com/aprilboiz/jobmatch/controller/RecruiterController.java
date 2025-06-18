package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.dto.request.CompanyRequest;
import com.aprilboiz.jobmatch.dto.response.CompanyResponse;
import com.aprilboiz.jobmatch.dto.response.JobResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.UserPrincipal;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
@PreAuthorize("hasRole('RECRUITER')")
@Tag(name = "Recruiter Management", description = "Operations for recruiters to manage their job postings, company profile, and recruitment activities")
public class RecruiterController {
    private final JobService jobService;
    private final MessageService messageService;
    private final CompanyService companyService;

    public RecruiterController(JobService jobService, MessageService messageService, CompanyService companyService) {
        this.jobService = jobService;
        this.messageService = messageService;
        this.companyService = companyService;
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
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getJobsByRecruiter(
            @Parameter(description = "Pagination parameters for job listing") Pageable pageable) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Recruiter recruiter = userPrincipal.getUser().getRecruiter();
        if (recruiter == null) {
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
                    Update the company profile associated with the recruiter's account.
                    
                    This endpoint allows recruiters to modify their company information including:
                    - Company name and description
                    - Industry and company size
                    - Location and contact information
                    - Company benefits and culture details
                    - Logo and branding assets
                    
                    **Important Notes:**
                    - Changes affect all job postings associated with this company
                    - Some changes may require admin approval
                    - Updated information will be reflected in job search results
                    
                    Only recruiters associated with the company can make updates.
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
                    description = "Invalid company data or validation errors",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not a recruiter or not authorized to update this company",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Company not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PutMapping("/company/profile")
    public ResponseEntity<ApiResponse<Void>> updateCompanyProfile(
            @Parameter(description = "Updated company profile data", required = true)
            @RequestBody @Valid CompanyRequest request,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Recruiter recruiter = userPrincipal.getUser().getRecruiter();
        companyService.updateCompany(recruiter.getCompany().getId(), request);
        String successMessage = messageService.getMessage("api.success.recruiter.profile.updated");
        return ResponseEntity.ok(ApiResponse.success(successMessage, null));
    }
}
