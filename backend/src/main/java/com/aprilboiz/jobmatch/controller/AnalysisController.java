package com.aprilboiz.jobmatch.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.aprilboiz.jobmatch.dto.AnalysisDTO;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Job;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.model.UserPrincipalAdapter;
import com.aprilboiz.jobmatch.repository.CvRepository;
import com.aprilboiz.jobmatch.repository.JobRepository;
import com.aprilboiz.jobmatch.service.AnalysisService;
import com.aprilboiz.jobmatch.service.MessageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/analysis")
@Tag(name = "AI Analysis", description = "AI-powered CV and Job Description analysis and matching")
public class AnalysisController {
    
    private static final Logger logger = LoggerFactory.getLogger(AnalysisController.class);
    
    private final AnalysisService analysisService;
    private final MessageService messageService;
    private final JobRepository jobRepository;
    private final CvRepository cvRepository;
    
    public AnalysisController(AnalysisService analysisService, MessageService messageService, 
                            JobRepository jobRepository, CvRepository cvRepository) {
        this.analysisService = analysisService;
        this.messageService = messageService;
        this.jobRepository = jobRepository;
        this.cvRepository = cvRepository;
    }
    
    @Operation(
        summary = "Analyze CV against Job Description using text input",
        description = """
                Perform AI-powered analysis between CV text and Job Description text.
                
                This endpoint:
                - Accepts CV and JD as text input
                - Uses multiple AI models for comprehensive analysis
                - Returns similarity scores, match predictions, and recommendations
                - Provides confidence levels and method reliability information
                
                The analysis includes:
                - Overall similarity score (0-100%)
                - Individual model scores (Doc2Vec, SBERT)
                - Match prediction with confidence levels
                - Actionable recommendations for improvement
                """
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Analysis completed successfully",
            content = @Content(schema = @Schema(implementation = AnalysisDTO.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request parameters"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "503",
            description = "AI service is currently unavailable"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "408",
            description = "AI service request timed out"
        )
    })
    @PostMapping("/analyze-text")
    public ResponseEntity<ApiResponse<AnalysisDTO>> analyzeText(
            @Parameter(description = "CV text", required = true)
            @RequestParam String cvText,
            @Parameter(description = "Job description text", required = true)
            @RequestParam String jobDescriptionText) {
        
        logger.info("Received text analysis request for CV length: {} characters, JD length: {} characters", 
                   cvText.length(), jobDescriptionText.length());
        
        AnalysisDTO analysisResult = analysisService.analyzeTexts(cvText, jobDescriptionText);
        
        String successMessage = messageService.getMessage("api.success.analysis.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, analysisResult));
    }
    
    @Operation(
        summary = "Analyze candidate's CV against specific job",
        description = """
                Analyze a candidate's existing CV against a specific job posting.
                
                This endpoint:
                - Requires candidate authentication
                - Uses stored CV and job data
                - Provides job-specific matching analysis
                - Helps candidates understand their fit for specific positions
                
                Only accessible by the CV owner (candidate).
                """
    )
    @PostMapping("/job-match/{jobId}/cv/{cvId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<AnalysisDTO>> analyzeJobMatch(
            @Parameter(description = "Job ID to analyze against") @PathVariable Long jobId,
            @Parameter(description = "CV ID to analyze") @PathVariable Long cvId) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) auth.getPrincipal();
        User user = userPrincipalAdapter.getUser();
        
        if (!(user instanceof Candidate candidate)) {
            throw new SecurityException(messageService.getMessage("error.authorization.candidate.required"));
        }
        
        // Validate job exists
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.job", jobId)));
        
        // Validate CV exists and belongs to candidate
        CV cv = cvRepository.findByIdAndCandidate(cvId, candidate)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.cv")));
        
        logger.info("Analyzing job match for candidate {} - Job: {}, CV: {}", 
                   candidate.getId(), jobId, cvId);
        
        AnalysisDTO analysisResult = analysisService.analyzeJobMatch(job, cv);
        
        String successMessage = messageService.getMessage("api.success.job.match.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, analysisResult));
    }
    
    @Operation(
        summary = "Health check for AI analysis service",
        description = """
                Check the availability and status of the AI analysis service.
                
                Returns:
                - Service availability status
                - Response time information
                - Available AI models status
                
                Useful for monitoring and troubleshooting.
                """
    )
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        logger.info("AI service health check requested");
        
        try {
            boolean isHealthy = analysisService.isAIServiceHealthy();
            
            if (isHealthy) {
                return ResponseEntity.ok(ApiResponse.success("AI analysis service is healthy", 
                        messageService.getMessage("api.success.ai.service.healthy")));
            } else {
                return ResponseEntity.ok(ApiResponse.success("AI analysis service is not responding normally", 
                        messageService.getMessage("api.warning.ai.service.unhealthy")));
            }
        } catch (Exception e) {
            logger.warn("AI service health check failed: {}", e.getMessage());
            // Don't throw the exception, just return the status
            return ResponseEntity.ok(ApiResponse.success("AI analysis service is not responding normally", 
                    messageService.getMessage("api.warning.ai.service.unhealthy")));
        }
    }
} 