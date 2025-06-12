package com.aprilboiz.jobmatch.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Authentication response containing tokens and user information")
public class AuthResponse {
    @Schema(description = "Token type (always Bearer)", example = "Bearer")
    private final String tokenType = "Bearer";
    
    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "Refresh token for obtaining new access tokens", example = "refresh_token_string")
    private String refreshToken;
    
    @Schema(description = "Token expiration time in seconds", example = "3600")
    private long expiresIn;
}
