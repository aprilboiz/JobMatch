package com.aprilboiz.jobmatch.security;

import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper;
    
    public CustomAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, 
                        AuthenticationException authException) throws IOException, ServletException {
        
        log.warn("Authentication failed for request to {}: {}", request.getRequestURI(), authException.getMessage());
        
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        String errorMessage = determineErrorMessage(request, authException);
        ApiResponse<Void> apiResponse = ApiResponse.error(errorMessage);
        
        String json = objectMapper.writeValueAsString(apiResponse);
        response.getWriter().write(json);
    }
    
    private String determineErrorMessage(HttpServletRequest request, AuthenticationException authException) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return "Authentication required. Please provide a valid Bearer token.";
        }
        
        if (authException.getMessage().toLowerCase().contains("expired")) {
            return "Authentication failed. Your token has expired. Please login again.";
        }
        
        if (authException.getMessage().toLowerCase().contains("invalid")) {
            return "Authentication failed. Invalid token provided.";
        }
        
        return "Authentication failed. Please check your credentials and try again.";
    }
} 