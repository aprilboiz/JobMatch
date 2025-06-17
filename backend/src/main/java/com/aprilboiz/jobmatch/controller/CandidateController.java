package com.aprilboiz.jobmatch.controller;

import java.net.URI;
import java.util.List;

import com.aprilboiz.jobmatch.dto.request.ApplicationRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.service.ApplicationService;
import com.aprilboiz.jobmatch.service.CvService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.service.MessageService;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/me")
@PreAuthorize("hasRole('CANDIDATE')")
@Tag(name = "Candidate Management", description = "Operations for managing candidate profiles and information")
public class CandidateController {
    private final ApplicationService applicationService;
    private final CvService cvService;
    private final MessageService messageService;

    public CandidateController(ApplicationService applicationService, CvService cvService, MessageService messageService) {
        this.applicationService = applicationService;
        this.cvService = cvService;
        this.messageService = messageService;
    }

    @PostMapping("/cvs")
    public ResponseEntity<ApiResponse<CvResponse>> createCv(@RequestParam("file") MultipartFile file) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Candidate candidate = userPrincipal.getUser().getCandidate();
        if (candidate == null) {
            throw new AccessDeniedException("User is not a candidate!");
        }
        CvResponse cvResponse = cvService.createCv(file, candidate);
        String successMessage = messageService.getMessage("api.success.cv.created");
        return ResponseEntity.created(URI.create(cvResponse.getFileUri()))
                .body(ApiResponse.success(successMessage, cvResponse));
    }

    @GetMapping("/cvs")
    public ResponseEntity<ApiResponse<List<CvResponse>>> getAllCv(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Candidate candidate = userPrincipal.getUser().getCandidate();
        List<CvResponse> cvResponses = cvService.getAllCv(candidate);
        String successMessage = messageService.getMessage("api.success.cv.fetched");
        return ResponseEntity.ok(ApiResponse.success(successMessage, cvResponses));
    }

    @GetMapping("/cvs/{id}")
    public ResponseEntity<ApiResponse<CvResponse>> getCv(@PathVariable Long id) {
        CvResponse cvResponse = cvService.getCv(id);
        String successMessage = messageService.getMessage("api.success.cv.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, cvResponse));
    }

    @DeleteMapping("/cvs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCv(@PathVariable Long id) {
        cvService.deleteCv(id);
        String successMessage = messageService.getMessage("api.success.cv.deleted");
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(successMessage, null));
    }

    @GetMapping("/cvs/{id}/download")
    public ResponseEntity<ApiResponse<Resource>> downloadCv(@PathVariable Long id) {
        Resource resource = cvService.downloadCv(id);
        String successMessage = messageService.getMessage("api.success.cv.downloaded");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(ApiResponse.success(successMessage, resource));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getAllApplications(Pageable pageable, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Candidate candidate = userPrincipal.getUser().getCandidate();
        if (candidate == null) {
            throw new AccessDeniedException("User is not a candidate!");
        }
        PageRequest pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), pageable.getSortOr(Sort.by(Sort.Direction.DESC, "createdAt")));
        Page<ApplicationResponse> applicationResponses = applicationService.getAllApplications(pageRequest);
        String successMessage = messageService.getMessage("api.success.applications.fetched");
        return ResponseEntity.ok(ApiResponse.success(successMessage, applicationResponses));
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getApplication(@PathVariable Long id) {
        ApplicationDetailResponse applicationResponse = applicationService.getApplication(id);
        String successMessage = messageService.getMessage("api.success.application.retrieved");
        return ResponseEntity.ok(ApiResponse.success(successMessage, applicationResponse));
    }

    @PostMapping("/applications")
    public ResponseEntity<ApiResponse<Void>> createApplication(@RequestBody @Valid ApplicationRequest request) {
        ApplicationResponse createdApplication = applicationService.createApplication(request);
        URI uri = UriComponentsBuilder.fromPath("/api/me/applications/{id}").buildAndExpand(createdApplication.getId()).toUri();
        String successMessage = messageService.getMessage("api.success.application.created");
        return ResponseEntity.created(uri).body(ApiResponse.success(successMessage, null));
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(@PathVariable Long id) {
        applicationService.withdrawApplication(id);
        String successMessage = messageService.getMessage("api.success.application.withdrawn");
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success(successMessage, null));
    }
}
