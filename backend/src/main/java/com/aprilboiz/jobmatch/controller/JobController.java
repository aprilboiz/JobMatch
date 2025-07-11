package com.aprilboiz.jobmatch.controller;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import com.aprilboiz.jobmatch.enumerate.JobStatus;
import com.aprilboiz.jobmatch.enumerate.JobType;
import com.aprilboiz.jobmatch.model.JobCategory;
import com.aprilboiz.jobmatch.service.JobCategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import com.aprilboiz.jobmatch.dto.request.JobRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.dto.response.JobResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
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
@RequestMapping("/api/jobs")
@Tag(name = "Job Management", description = "Operations for managing job postings including creation, search, filtering, and application management")
public class JobController {
        private final JobService jobService;
        private final JobCategoryService jobCategoryService;
        private final MessageService messageService;

        public JobController(JobService jobService, JobCategoryService jobCategoryService,
                        MessageService messageService) {
                this.jobService = jobService;
                this.jobCategoryService = jobCategoryService;
                this.messageService = messageService;
        }

        @Operation(summary = "Get All Jobs", description = """
                        Retrieve a paginated list of all available job postings.

                        This endpoint returns all active job postings with basic information including:
                        - Job title and description
                        - Company name and location
                        - Salary range and job type
                        - Application deadline

                        Results are sorted by creation date (most recent first) by default.
                        Public endpoint - no authentication required.
                        """)
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Jobs retrieved successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class)))
        })
        @GetMapping
        public ResponseEntity<ApiResponse<Page<JobResponse>>> getAllJobs(
                        @Parameter(description = "Pagination parameters") Pageable pageable) {
                PageRequest pageRequest = PageRequest.of(
                                pageable.getPageNumber(),
                                pageable.getPageSize(),
                                pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt")));
                String successMessage = messageService.getMessage("api.success.jobs.retrieved");
                return ResponseEntity.ok(ApiResponse.success(successMessage, jobService.getAllJobs(pageRequest)));
        }

        @GetMapping("/search")
        @Operation(summary = "Search and filter jobs", description = "Search jobs by keyword and apply various filters")
        public ResponseEntity<ApiResponse<Page<JobResponse>>> searchJobs(
                        @Parameter(description = "Search keyword (searches in title, description, and company name)") @RequestParam(required = false) String keyword,

                        @Parameter(description = "Filter by job type") @RequestParam(required = false) JobType jobType,

                        @Parameter(description = "Filter by job category code (1-24)") @RequestParam(required = false) Integer jobCategory,

                        @Parameter(description = "Filter by location") @RequestParam(required = false) String location,

                        @Parameter(description = "Minimum salary") @RequestParam(required = false) BigDecimal minSalary,

                        @Parameter(description = "Maximum salary") @RequestParam(required = false) BigDecimal maxSalary,

                        @Parameter(description = "Filter by company name") @RequestParam(required = false) String companyName,

                        @Parameter(description = "Filter by job status") @RequestParam(required = false) JobStatus status,

                        @Parameter(description = "Application deadline after this date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate applicationDeadlineAfter,

                        Pageable pageable) {

                PageRequest pageRequest = PageRequest.of(
                                pageable.getPageNumber(),
                                pageable.getPageSize(),
                                pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt")));

                // Validate job category ID if provided
                if (jobCategory != null && !jobCategoryService.existsById(jobCategory)) {
                        throw new IllegalArgumentException("Invalid job category code: " + jobCategory);
                }

                Page<JobResponse> jobs = jobService.searchAndFilterJobs(
                                keyword, jobType, jobCategory, location, minSalary, maxSalary,
                                companyName, status, applicationDeadlineAfter, pageRequest);

                String successMessage = messageService.getMessage("api.success.jobs.retrieved");
                return ResponseEntity.ok(ApiResponse.success(successMessage, jobs));
        }

        @Operation(summary = "Get Job Details", description = """
                        Retrieve detailed information about a specific job posting.

                        This endpoint returns comprehensive job information including:
                        - Complete job description and requirements
                        - Company details and benefits
                        - Application process information
                        - Related jobs and statistics

                        Public endpoint - no authentication required.
                        """)
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Job details retrieved successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Job not found", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class)))
        })
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<JobResponse>> getJob(
                        @Parameter(description = "Job ID", required = true, example = "1") @PathVariable Long id) {
                String successMessage = messageService.getMessage("api.success.job.retrieved");
                return ResponseEntity.ok(ApiResponse.success(successMessage, jobService.getJob(id)));
        }

        @Operation(summary = "Get Applications for Job (Recruiter Only)", description = """
                        Retrieve all applications submitted for a specific job posting.

                        This endpoint is restricted to recruiters and returns:
                        - Paginated list of applications
                        - Candidate information and CV details
                        - Application status and submission date
                        - Application notes and recruiter comments

                        Only the recruiter who posted the job can access its applications.
                        """, security = @SecurityRequirement(name = "Bearer Authentication"))
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Applications retrieved successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not a recruiter or not the job owner", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Job not found", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class)))
        })
        @GetMapping("/{id}/applications")
        @PreAuthorize("hasRole('RECRUITER')")
        public ResponseEntity<ApiResponse<Page<ApplicationDetailResponse>>> getApplicationsForJob(
                        @Parameter(description = "Job ID", required = true, example = "1") @PathVariable Long id,
                        @Parameter(description = "Pagination parameters") Pageable pageable) {
                PageRequest pageRequest = PageRequest.of(
                                pageable.getPageNumber(),
                                pageable.getPageSize(),
                                pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt")));
                String successMessage = messageService.getMessage("api.success.applications.retrieved");
                return ResponseEntity.ok(
                                ApiResponse.success(successMessage, jobService.getJobApplications(id, pageRequest)));
        }

        @Operation(summary = "Create New Job Posting (Recruiter Only)", description = """
                        Create a new job posting as a recruiter.

                        This endpoint allows recruiters to create new job opportunities with:
                        - Job title, description, and requirements
                        - Salary range and benefits
                        - Location and job type
                        - Application deadline and process

                        The job will be associated with the recruiter's company profile.
                        """, security = @SecurityRequirement(name = "Bearer Authentication"))
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Job created successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid job data", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not a recruiter", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class)))
        })
        @PostMapping
        @PreAuthorize("hasRole('RECRUITER')")
        public ResponseEntity<ApiResponse<JobResponse>> createJob(
                        @Parameter(description = "Job creation data", required = true) @RequestBody @Valid JobRequest jobRequest) {
                JobResponse jobResponse = jobService.createJob(jobRequest);
                URI jobUri = UriComponentsBuilder.fromPath("/api/jobs/{id}").buildAndExpand(jobResponse.getId())
                                .toUri();
                String successMessage = messageService.getMessage("api.success.created", "Job");
                return ResponseEntity.created(jobUri)
                                .body(ApiResponse.success(successMessage, jobResponse));
        }

        @Operation(summary = "Delete Job Posting (Recruiter Only)", description = """
                        Delete a job posting permanently.

                        This endpoint allows recruiters to remove their job postings.
                        **Warning:** This action cannot be undone and will affect:
                        - All pending applications will be marked as "Job Deleted"
                        - Job will be removed from search results
                        - Historical data will remain for reporting purposes

                        Only the recruiter who created the job can delete it.
                        """, security = @SecurityRequirement(name = "Bearer Authentication"))
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Job deleted successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not a recruiter or not the job owner", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Job not found", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class)))
        })
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('RECRUITER')")
        public ResponseEntity<Void> deleteJob(
                        @Parameter(description = "Job ID to delete", required = true, example = "1") @PathVariable Long id) {
                jobService.deleteJob(id);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Update Job Posting (Recruiter Only)", description = """
                        Update an existing job posting.

                        This endpoint allows recruiters to modify their job postings including:
                        - Job description and requirements
                        - Salary and benefits information
                        - Application deadline
                        - Job status (active/inactive)

                        Only the recruiter who created the job can update it.
                        """, security = @SecurityRequirement(name = "Bearer Authentication"))
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Job updated successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid job data", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not a recruiter or not the job owner", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Job not found", content = @Content(schema = @Schema(implementation = ApiResponse.Error.class)))
        })
        @PutMapping("/{id}")
        @PreAuthorize("hasRole('RECRUITER')")
        public ResponseEntity<ApiResponse<JobResponse>> updateJob(
                        @Parameter(description = "Job ID to update", required = true, example = "1") @PathVariable Long id,
                        @Parameter(description = "Updated job data", required = true) @RequestBody @Valid JobRequest jobRequest) {
                JobResponse jobResponse = jobService.updateJob(id, jobRequest);
                String successMessage = messageService.getMessage("api.success.job.updated");
                return ResponseEntity.ok(ApiResponse.success(successMessage, jobResponse));
        }

        @Operation(summary = "Get Available Job Types", description = """
                        Retrieve all available job types in the system.

                        This endpoint returns an array of job type enums that can be used for:
                        - Job creation and filtering
                        - Search parameters
                        - Form dropdowns

                        Common job types include: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE.
                        """)
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Job types retrieved successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class)))
        })
        @GetMapping("/job-types")
        public ResponseEntity<ApiResponse<JobType[]>> getJobTypes() {
                String successMessage = messageService.getMessage("operation.completed");
                return ResponseEntity.ok(ApiResponse.success(successMessage, JobType.values()));
        }

        @Operation(summary = "Get Available Job Categories", description = """
                        Retrieve all available job categories in the system.

                        This endpoint returns an array of job category objects with code and description that can be used for:
                        - Job creation and filtering
                        - Search parameters
                        - Form dropdowns

                        Categories include various industries like IT, Marketing, Finance, etc.
                        """)
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Job categories retrieved successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class)))
        })
        @GetMapping("/job-categories")
        public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getJobCategories() {
                List<Map<String, Object>> categories = new ArrayList<>();
                List<JobCategory> jobCategories = jobCategoryService.getAllActiveCategories();
                for (JobCategory category : jobCategories) {
                        Map<String, Object> categoryMap = new HashMap<>();
                        categoryMap.put("code", category.getId());
                        categoryMap.put("name", category.getName());
                        categoryMap.put("description", category.getDescription());
                        categories.add(categoryMap);
                }
                String successMessage = messageService.getMessage("operation.completed");
                return ResponseEntity.ok(ApiResponse.success(successMessage, categories));
        }

        @Operation(summary = "Get Available Job Statuses", description = """
                        Retrieve all available job statuses in the system.

                        This endpoint returns an array of job status enums including:
                        - ACTIVE: Job is open for applications
                        - INACTIVE: Job is temporarily closed
                        - EXPIRED: Application deadline has passed
                        - FILLED: Position has been filled
                        """)
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Job statuses retrieved successfully", content = @Content(schema = @Schema(implementation = ApiResponse.class)))
        })
        @GetMapping("/job-statuses")
        public ResponseEntity<ApiResponse<JobStatus[]>> getJobStatuses() {
                String successMessage = messageService.getMessage("operation.completed");
                return ResponseEntity.ok(ApiResponse.success(successMessage, JobStatus.values()));
        }

        @GetMapping("/filter-options/locations")
        @Operation(summary = "Get all available job locations", description = "Returns a list of distinct locations for filtering jobs")
        public ResponseEntity<ApiResponse<List<String>>> getAvailableLocations() {
                List<String> locations = jobService.getDistinctLocations();
                String successMessage = messageService.getMessage("operation.completed");
                return ResponseEntity.ok(ApiResponse.success(successMessage, locations));
        }

        @GetMapping("/filter-options/companies")
        @Operation(summary = "Get all available company names", description = "Returns a list of distinct company names for filtering jobs")
        public ResponseEntity<ApiResponse<List<String>>> getAvailableCompanyNames() {
                List<String> companyNames = jobService.getDistinctCompanyNames();
                String successMessage = messageService.getMessage("operation.completed");
                return ResponseEntity.ok(ApiResponse.success(successMessage, companyNames));
        }
}
