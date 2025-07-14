package com.aprilboiz.jobmatch.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.aprilboiz.jobmatch.dto.AnalysisDTO;
import com.aprilboiz.jobmatch.exception.AIServiceException;
import com.aprilboiz.jobmatch.service.AIService;

@Service
public class AIServiceImpl implements AIService {
    
    private static final Logger logger = LoggerFactory.getLogger(AIServiceImpl.class);
    
    @Value("${ai-service.base-url}")
    private String aiServiceBaseUrl;
    private final RestTemplate restTemplate;

    public AIServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private String constructUrl(String path) {
        return aiServiceBaseUrl + path;
    }

    @Override
    public AnalysisDTO analyze(String jdText, String cvText) {
        String url = constructUrl("/match-files");
        logger.info("Starting CV-JD text analysis with AI service at: {}", url);
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("jd_text", jdText);
            body.add("cv_text", cvText);
            
            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<AnalysisDTO> response = restTemplate.postForEntity(url, entity, AnalysisDTO.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("Successfully received analysis response from AI service");
                return response.getBody();
            } else {
                logger.warn("AI service returned unexpected response. Status: {}", response.getStatusCode());
                throw new AIServiceException("AI service returned unexpected response: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException e) {
            logger.error("AI service returned client error. Status: {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new AIServiceException.AIServiceBadRequestException("Invalid request parameters", e);
            } else {
                throw new AIServiceException("AI service client error: " + e.getStatusCode(), e);
            }
        } catch (HttpServerErrorException e) {
            logger.error("AI service returned server error. Status: {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AIServiceException.AIServiceUnavailableException("Server error: " + e.getStatusCode(), e);
        } catch (ResourceAccessException e) {
            logger.error("Failed to connect to AI service at {}: {}", url, e.getMessage());
            throw new AIServiceException.AIServiceTimeoutException("Could not connect to AI service. Service may be down or unreachable", e);
        } catch (RestClientException e) {
            logger.error("Unexpected error calling AI service: {}", e.getMessage());
            throw new AIServiceException.AIServiceUnavailableException("Unexpected error occurred while calling AI service", e);
        } catch (Exception e) {
            logger.error("Unexpected error during AI service analysis: {}", e.getMessage(), e);
            throw new AIServiceException("Unexpected error during analysis", e);
        }
    }

    @Override
    public AnalysisDTO analyze(String jdText, Resource cvFile) {
        String url = constructUrl("/match-files");
        logger.info("Starting CV file analysis with AI service at: {}", url);
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("jd_text", jdText);
            
            // Create a ByteArrayResource from the Resource file and preserve filename
            byte[] fileBytes = cvFile.getInputStream().readAllBytes();
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return cvFile.getFilename();
                }
            };
            body.add("cv_file", fileResource);
            
            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<AnalysisDTO> response = restTemplate.postForEntity(url, entity, AnalysisDTO.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("Successfully received analysis response from AI service for file: {}", cvFile.getFilename());
                return response.getBody();
            } else {
                logger.warn("AI service returned unexpected response. Status: {}", response.getStatusCode());
                throw new AIServiceException("AI service returned unexpected response: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException e) {
            logger.error("AI service returned client error. Status: {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new AIServiceException.AIServiceBadRequestException("Invalid file or request parameters", e);
            } else {
                throw new AIServiceException("AI service client error: " + e.getStatusCode(), e);
            }
        } catch (HttpServerErrorException e) {
            logger.error("AI service returned server error. Status: {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AIServiceException.AIServiceUnavailableException("Server error: " + e.getStatusCode(), e);
        } catch (ResourceAccessException e) {
            logger.error("Failed to connect to AI service at {}: {}", url, e.getMessage());
            throw new AIServiceException.AIServiceTimeoutException("Could not connect to AI service. Service may be down or unreachable", e);
        } catch (RestClientException e) {
            logger.error("Unexpected error calling AI service: {}", e.getMessage());
            throw new AIServiceException.AIServiceUnavailableException("Unexpected error occurred while calling AI service", e);
        } catch (Exception e) {
            logger.error("Unexpected error during AI service file analysis: {}", e.getMessage(), e);
            throw new AIServiceException("Failed to analyze CV file", e);
        }
    }
}
