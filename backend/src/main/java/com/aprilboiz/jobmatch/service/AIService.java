package com.aprilboiz.jobmatch.service;

import org.springframework.core.io.Resource;

import com.aprilboiz.jobmatch.dto.AnalysisDTO;

public interface AIService {
    AnalysisDTO analyze(String jdText, String cvText);
    AnalysisDTO analyze(String jdText, Resource cvFile);
}
