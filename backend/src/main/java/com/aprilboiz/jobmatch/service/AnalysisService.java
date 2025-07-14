package com.aprilboiz.jobmatch.service;

import org.springframework.core.io.Resource;

import com.aprilboiz.jobmatch.dto.AnalysisDTO;
import com.aprilboiz.jobmatch.model.Application;
import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Job;

public interface AnalysisService {
    
    /**
     * Analyze CV against Job Description using text inputs
     */
    AnalysisDTO analyzeTexts(String cvText, String jobDescriptionText);
    
    /**
     * Analyze CV file against Job Description text
     */
    AnalysisDTO analyzeFile(Resource cvFile, String jobDescriptionText);
    
    /**
     * Analyze existing CV against existing Job
     */
    AnalysisDTO analyzeJobMatch(Job job, CV cv);
    
    /**
     * Analyze application and update it with AI scoring
     */
    AnalysisDTO analyzeApplication(Application application);
    
    /**
     * Check if AI service is available
     */
    boolean isAIServiceHealthy();
    
    /**
     * Get AI analysis for existing application (if available)
     */
    AnalysisDTO getApplicationAnalysis(Application application);
} 