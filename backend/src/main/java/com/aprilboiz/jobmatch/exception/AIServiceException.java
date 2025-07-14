package com.aprilboiz.jobmatch.exception;

public class AIServiceException extends RuntimeException {
    
    public AIServiceException(String message) {
        super(message);
    }
    
    public AIServiceException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static class AIServiceUnavailableException extends AIServiceException {
        public AIServiceUnavailableException(String message) {
            super("AI Service is currently unavailable: " + message);
        }
        
        public AIServiceUnavailableException(String message, Throwable cause) {
            super("AI Service is currently unavailable: " + message, cause);
        }
    }
    
    public static class AIServiceTimeoutException extends AIServiceException {
        public AIServiceTimeoutException(String message) {
            super("AI Service request timed out: " + message);
        }
        
        public AIServiceTimeoutException(String message, Throwable cause) {
            super("AI Service request timed out: " + message, cause);
        }
    }
    
    public static class AIServiceBadRequestException extends AIServiceException {
        public AIServiceBadRequestException(String message) {
            super("AI Service returned bad request: " + message);
        }
        
        public AIServiceBadRequestException(String message, Throwable cause) {
            super("AI Service returned bad request: " + message, cause);
        }
    }
} 