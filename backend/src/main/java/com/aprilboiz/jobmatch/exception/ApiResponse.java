package com.aprilboiz.jobmatch.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Schema(description = "Standard API response wrapper")
public class ApiResponse<T> {
    @Schema(description = "Indicates if the operation was successful", example = "true")
    private boolean success;
    
    @Schema(description = "Human-readable message describing the result", example = "Operation completed successfully")
    private String message;
    
    @Schema(description = "Timestamp when the response was generated", example = "2024-01-15T10:30:00")
    private LocalDateTime timestamp;
    
    @Schema(description = "Response data payload")
    private T data;

    // Convenience static factory methods
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Operation successful")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // For error responses in Swagger documentation
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @SuperBuilder
    @Schema(description = "Error response wrapper")
    public static class Error {
        @Schema(description = "Indicates if the operation was successful", example = "false")
        private boolean success;
        
        @Schema(description = "Error message describing what went wrong", example = "Invalid credentials")
        private String message;
        
        @Schema(description = "Timestamp when the error occurred", example = "2024-01-15T10:30:00")
        private LocalDateTime timestamp;
        
        @Schema(description = "Error data payload", nullable = true)
        private Object data;
    }
}


