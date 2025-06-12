package com.aprilboiz.jobmatch.controller;

import java.net.URI;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.service.CandidateService;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/me")
@PreAuthorize("hasRole('CANDIDATE')")
@Tag(name = "Candidate Management", description = "Operations for managing candidate profiles and information")
public class CandidateController {
    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @PostMapping("/cvs")
    public ResponseEntity<ApiResponse<CvResponse>> createCandidateCv(@RequestParam("file") MultipartFile file) {
        CvResponse cvResponse = candidateService.createCandidateCv(file);
        return ResponseEntity.created(URI.create(cvResponse.getFileUri())).body(ApiResponse.success("CV created successfully", cvResponse));
    }

    @GetMapping("/cvs")
    public ResponseEntity<ApiResponse<List<CvResponse>>> getAllCandidateCv() {
        List<CvResponse> cvResponses = candidateService.getAllCandidateCv();
        return ResponseEntity.ok(ApiResponse.success("CVs fetched successfully", cvResponses));
    }

    @GetMapping("/cvs/{id}")
    public ResponseEntity<ApiResponse<CvResponse>> getCandidateCv(@PathVariable Long id) {
        CvResponse cvResponse = candidateService.getCandidateCv(id);
        return ResponseEntity.ok(ApiResponse.success("CV fetched successfully", cvResponse));
    }

    @DeleteMapping("/cvs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCandidateCv(@PathVariable Long id) {
        candidateService.deleteCandidateCv(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success("CV deleted successfully", null));
    }

    @GetMapping("/cvs/{id}/download")
    public ResponseEntity<ApiResponse<Resource>> downloadCandidateCv(@PathVariable Long id) {
        Resource resource = candidateService.downloadCandidateCv(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(ApiResponse.success("CV downloaded successfully", resource));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getAllCandidateApplications() {
        List<ApplicationResponse> applicationResponses = candidateService.getAllCandidateApplications();
        return ResponseEntity.ok(ApiResponse.success("Applications fetched successfully", applicationResponses));
    }

}
