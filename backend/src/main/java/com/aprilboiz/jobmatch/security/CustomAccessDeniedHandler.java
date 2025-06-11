package com.aprilboiz.jobmatch.security;

import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    
    private final ObjectMapper objectMapper;
    
    public CustomAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, 
                      AccessDeniedException accessDeniedException) throws IOException, ServletException {
        
        log.warn("Access denied for request to {}: {}", request.getRequestURI(), accessDeniedException.getMessage());
        
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        ApiResponse<Void> apiResponse = ApiResponse.error("Access denied. You don't have permission to access this resource.");
        
        String json = objectMapper.writeValueAsString(apiResponse);
        response.getWriter().write(json);
    }
} 