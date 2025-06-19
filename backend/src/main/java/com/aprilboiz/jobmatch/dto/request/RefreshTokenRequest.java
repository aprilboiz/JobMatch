package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank(message = "{" + ValidationMessages.REFRESH_TOKEN_REQUIRED + "}")
    private String refreshToken;
} 