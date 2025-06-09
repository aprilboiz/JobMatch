package com.aprilboiz.jobmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private final String tokenType = "Bearer";
    private String token;
    private String refreshToken;
    private UserResponse user;
    private long expiresIn;
}
