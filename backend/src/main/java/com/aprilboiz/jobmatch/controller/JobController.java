package com.aprilboiz.jobmatch.controller;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.aprilboiz.jobmatch.dto.request.JobRequest;
import com.aprilboiz.jobmatch.dto.response.JobResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.service.JobService;
import com.aprilboiz.jobmatch.service.MessageService;

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

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(@RequestBody @Valid JobRequest jobRequest) {
        JobResponse jobResponse = jobService.createJob(jobRequest);
        URI jobUri = UriComponentsBuilder.fromPath("/api/jobs/{id}").buildAndExpand(jobResponse.getId()).toUri();
        String successMessage = messageService.getMessage("api.success.job.created");
        return ResponseEntity.created(jobUri)
                .body(ApiResponse.success(successMessage, jobResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJob(@PathVariable Long id) {
        String successMessage = messageService.getMessage("api.success.job.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, jobService.getJob(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(@PathVariable Long id, @RequestBody @Valid JobRequest jobRequest) {
        JobResponse jobResponse = jobService.updateJob(id, jobRequest);
        String successMessage = messageService.getMessage("api.success.job.updated");
        return ResponseEntity.ok(ApiResponse.success(successMessage, jobResponse));
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
}
