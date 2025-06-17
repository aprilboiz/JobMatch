package com.aprilboiz.jobmatch.controller;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;

import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.enumerate.JobStatus;
import com.aprilboiz.jobmatch.enumerate.JobType;
import com.aprilboiz.jobmatch.model.Job;
import com.aprilboiz.jobmatch.service.ApplicationService;
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
import com.aprilboiz.jobmatch.dto.response.JobResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.service.JobService;
import com.aprilboiz.jobmatch.service.MessageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Job Management", description = "Operations for managing jobs")
public class JobController {
    private final JobService jobService;
    private final MessageService messageService;

    public JobController(JobService jobService, MessageService messageService) {
        this.jobService = jobService;
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getAllJobs(Pageable pageable) {
        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        String successMessage = messageService.getMessage("api.success.jobs.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, jobService.getAllJobs(pageRequest)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search and filter jobs", 
               description = "Search jobs by keyword and apply various filters")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> searchJobs(
            @Parameter(description = "Search keyword (searches in title, description, and company name)")
            @RequestParam(required = false) String keyword,
            
            @Parameter(description = "Filter by job type")
            @RequestParam(required = false) JobType jobType,
            
            @Parameter(description = "Filter by location")
            @RequestParam(required = false) String location,
            
            @Parameter(description = "Minimum salary")
            @RequestParam(required = false) BigDecimal minSalary,
            
            @Parameter(description = "Maximum salary")
            @RequestParam(required = false) BigDecimal maxSalary,
            
            @Parameter(description = "Filter by company name")
            @RequestParam(required = false) String companyName,
            
            @Parameter(description = "Filter by job status")
            @RequestParam(required = false) JobStatus status,
            
            @Parameter(description = "Application deadline after this date (YYYY-MM-DD)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate applicationDeadlineAfter,
            
            Pageable pageable) {
        
        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        
        Page<JobResponse> jobs = jobService.searchAndFilterJobs(
                keyword, jobType, location, minSalary, maxSalary, 
                companyName, status, applicationDeadlineAfter, pageRequest);
        
        String successMessage = messageService.getMessage("api.success.jobs.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, jobs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJob(@PathVariable Long id) {
        String successMessage = messageService.getMessage("api.success.job.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, jobService.getJob(id)));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getApplicationsForJob(@PathVariable Long id, Pageable pageable) {
        PageRequest pageRequest = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        String successMessage = messageService.getMessage("api.success.applications.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, jobService.getJobApplications(id, pageRequest)));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(@RequestBody @Valid JobRequest jobRequest) {
        JobResponse jobResponse = jobService.createJob(jobRequest);
        URI jobUri = UriComponentsBuilder.fromPath("/api/jobs/{id}").buildAndExpand(jobResponse.getId()).toUri();
        String successMessage = messageService.getMessage("api.success.job.created");
        return ResponseEntity.created(jobUri)
                .body(ApiResponse.success(successMessage, jobResponse));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(@PathVariable Long id, @RequestBody @Valid JobRequest jobRequest) {
        JobResponse jobResponse = jobService.updateJob(id, jobRequest);
        String successMessage = messageService.getMessage("api.success.job.updated");
        return ResponseEntity.ok(ApiResponse.success(successMessage, jobResponse));
    }

    @GetMapping("/job-types")
    public ResponseEntity<ApiResponse<JobType[]>> getJobTypes() {
        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, JobType.values()));
    }

    @GetMapping("/job-statuses")
    public ResponseEntity<ApiResponse<JobStatus[]>> getJobStatuses() {
        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, JobStatus.values()));
    }

    @GetMapping("/filter-options/locations")
    @Operation(summary = "Get all available job locations", 
               description = "Returns a list of distinct locations for filtering jobs")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableLocations() {
        List<String> locations = jobService.getDistinctLocations();
        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, locations));
    }

    @GetMapping("/filter-options/companies")
    @Operation(summary = "Get all available company names", 
               description = "Returns a list of distinct company names for filtering jobs")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableCompanyNames() {
        List<String> companyNames = jobService.getDistinctCompanyNames();
        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, companyNames));
    }
}
