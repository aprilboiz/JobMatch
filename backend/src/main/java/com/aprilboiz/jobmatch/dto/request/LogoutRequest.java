package com.aprilboiz.jobmatch.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LogoutRequest {
    @NotBlank(message = "Access token is required")
    private String token;

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
} 