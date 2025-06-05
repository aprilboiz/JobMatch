package com.aprilboiz.jobmatch.service;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

public interface JwtService {
    String generateAccessToken(UserDetails userDetails);
    String generateRefreshToken(UserDetails userDetails);
    Boolean validateToken(String authToken);
    String extractUsername(String token);
    Long getExpirationTime();
    Long getRefreshTokenExpirationTime();
    
    // New methods for enhanced JWT functionality
    Date extractExpiration(String token);
    Boolean isTokenExpired(String token);
    String generateRefreshTokenWithJti(UserDetails userDetails, String jti);
    String extractJti(String token);
    Boolean validateRefreshToken(String refreshToken, UserDetails userDetails);
}
