package com.aprilboiz.jobmatch.controller;

import java.net.URI;
import java.util.List;

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

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Job Management", description = "Operations for managing jobs")
public class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(@RequestBody @Valid JobRequest jobRequest) {
        JobResponse jobResponse = jobService.createJob(jobRequest);
        URI jobUri = UriComponentsBuilder.fromPath("/api/jobs/{id}").buildAndExpand(jobResponse.getId()).toUri();
        return ResponseEntity.created(jobUri)
                .body(ApiResponse.success("Job created successfully", jobResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Job retrieved successfully", jobService.getJob(id)));
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
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully", jobResponse));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobResponse>>> getAllJobs() {
        return ResponseEntity.ok(ApiResponse.success("Jobs retrieved successfully", jobService.getAllJobs()));
    }
}
