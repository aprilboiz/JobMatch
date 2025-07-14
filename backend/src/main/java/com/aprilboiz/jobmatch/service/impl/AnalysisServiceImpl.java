package com.aprilboiz.jobmatch.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import com.aprilboiz.jobmatch.dto.AnalysisDTO;
import com.aprilboiz.jobmatch.exception.AIServiceException;
import com.aprilboiz.jobmatch.model.Application;
import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Job;
import com.aprilboiz.jobmatch.service.AIService;
import com.aprilboiz.jobmatch.service.AnalysisService;
import com.aprilboiz.jobmatch.storage.StorageService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class AnalysisServiceImpl implements AnalysisService {
    
    private static final Logger logger = LoggerFactory.getLogger(AnalysisServiceImpl.class);
    
    private final AIService aiService;
    private final StorageService storageService;
    
        public AnalysisServiceImpl(AIService aiService, StorageService storageService) {
        this.aiService = aiService;
        this.storageService = storageService;
    }
    
    @Override
    public AnalysisDTO analyzeTexts(String cvText, String jobDescriptionText) {
        logger.info("Analyzing texts - CV length: {}, JD length: {}", cvText.length(), jobDescriptionText.length());
        
        try {
            return aiService.analyze(jobDescriptionText, cvText);
        } catch (AIServiceException e) {
            logger.warn("AI service failed for text analysis: {}", e.getMessage());
            throw e; // Re-throw to be handled by global exception handler
        }
    }
    
    @Override
    public AnalysisDTO analyzeFile(Resource cvFile, String jobDescriptionText) {
        logger.info("Analyzing file: {} against job description", cvFile.getFilename());
        
        try {
            return aiService.analyze(jobDescriptionText, cvFile);
        } catch (AIServiceException e) {
            logger.warn("AI service failed for file analysis: {}", e.getMessage());
            throw e; // Re-throw to be handled by global exception handler
        }
    }
    
    @Override
    public AnalysisDTO analyzeJobMatch(Job job, CV cv) {
        logger.info("Analyzing job match - Job ID: {}, CV ID: {}", job.getId(), cv.getId());
        
        try {
            String jobDescriptionText = job.getDescription() != null ? job.getDescription() : buildJobDescriptionText(job);
            Resource cvResource = storageService.loadAsResource(cv.getFilePath());
            
            return aiService.analyze(jobDescriptionText, cvResource);
        } catch (AIServiceException e) {
            logger.warn("AI service failed for job match analysis: {}", e.getMessage());
            throw e; // Re-throw to be handled by global exception handler
        } 
    }
    
    @Override
    public AnalysisDTO analyzeApplication(Application application) {
        logger.info("Analyzing application ID: {}", application.getId());
        
        return analyzeJobMatch(application.getJob(), application.getCv());
    }
    
    @Override
    public boolean isAIServiceHealthy() {
        try {
            // Simple test to check if AI service is responding
            AnalysisDTO testResult = aiService.analyze("test job description", "test cv content");
            boolean isHealthy = testResult != null;
            logger.info("AI service health check: {}", isHealthy ? "HEALTHY" : "UNHEALTHY");
            return isHealthy;
        } catch (Exception e) {
            logger.warn("AI service health check failed: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    public AnalysisDTO getApplicationAnalysis(Application application) {
        // For now, we don't store analysis results, so we perform fresh analysis
        // In a production system, you might want to cache results
        logger.info("Getting analysis for application ID: {}", application.getId());
        
        return analyzeApplication(application);
    }
    
    /**
     * Create a fallback analysis response when AI service is unavailable
     */
    public AnalysisDTO createFallbackAnalysis() {
        AnalysisDTO fallback = new AnalysisDTO();
        fallback.setSimilarityScore(null);
        fallback.setMatchScore(null);
        fallback.setDoc2vecSimilarity(null);
        fallback.setSbertSimilarity(null);
        fallback.setRecommendation("AI analysis is currently unavailable. Please try again later.");
        fallback.setMethodUsed("fallback");
        fallback.setConfidenceLevel("unavailable");
        fallback.setMethodReliability("AI service is temporarily down");
        return fallback;
    }
    
    private String buildJobDescriptionText(Job job) {
        StringBuilder jobDescription = new StringBuilder();
        
        jobDescription.append("Job Title: ").append(job.getTitle()).append("\n\n");
        
        if (job.getDescription() != null) {
            jobDescription.append("Description: ").append(job.getDescription()).append("\n\n");
        }
        
        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            jobDescription.append("Required Skills: ").append(String.join(", ", job.getSkills())).append("\n\n");
        }
        
        if (job.getJobCategory() != null) {
            jobDescription.append("Job Category: ").append(job.getJobCategory().getName()).append("\n\n");
        }
        
        jobDescription.append("Job Type: ").append(job.getJobType()).append("\n");
        jobDescription.append("Location: ").append(job.getLocation()).append("\n");
        jobDescription.append("Number of Openings: ").append(job.getNumberOfOpenings()).append("\n");
        
        if (job.getMinSalary() != null && job.getMaxSalary() != null) {
            jobDescription.append("Salary Range: ").append(job.getCurrency()).append(" ")
                          .append(job.getMinSalary()).append(" - ").append(job.getMaxSalary())
                          .append(" (").append(job.getSalaryPeriod()).append(")").append("\n");
        }
        
        if (job.getApplicationDeadline() != null) {
            jobDescription.append("Application Deadline: ").append(job.getApplicationDeadline()).append("\n");
        }
        
        return jobDescription.toString();
    }
    
    /**
     * This method is no longer used as we now rely on the AI service 
     * to handle file processing through the Resource-based analyze method.
     * The AI service (Python) handles PDF, DOCX, DOC, and TXT files properly.
     */
    @Deprecated
    private String readCvFileContent(CV cv) throws IOException {
        logger.warn("Deprecated method readCvFileContent called. Use Resource-based analysis instead.");
        Path filePath = Paths.get(cv.getFilePath());
        
        if (!Files.exists(filePath)) {
            throw new IOException("CV file not found: " + cv.getFilePath());
        }
        
        // This is a fallback for text files only
        // The actual file processing should be handled by the AI service
        return Files.readString(filePath);
    }
} 