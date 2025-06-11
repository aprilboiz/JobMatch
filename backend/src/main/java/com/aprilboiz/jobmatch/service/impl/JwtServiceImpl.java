package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.exception.AuthException;
import com.aprilboiz.jobmatch.service.JwtService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Service
@Slf4j
public class JwtServiceImpl implements JwtService {
    
    @Value("${jwt.secret-key:7e28991c10c1f5294a74dbcab40b23d77a291c612692b97eb8f8c3d67c6d0e0507059122d8cb52b9ca009b214b83977cf4d4d7472d924c745102f1e18497df05}")
    private String secretKey;
    
    @Value("${jwt.access-token-expiration:3600}")
    private Long accessTokenExpiration; // seconds
    
    @Value("${jwt.refresh-token-expiration:7200}")
    private Long refreshTokenExpiration; // seconds

    @Override
    public String generateAccessToken(UserDetails userDetails) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + (accessTokenExpiration * 1000)); // Convert to milliseconds

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(getSigningKey())
                .compact();
    }

    @Override
    public String generateRefreshToken(UserDetails userDetails) {
        String jti = UUID.randomUUID().toString();
        return generateRefreshTokenWithJti(userDetails, jti);
    }

    @Override
    public Boolean validateToken(String authToken) {
        try {
            this.extractAllClaims(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
            throw new AuthException("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("JWT token is expired: {}", ex.getMessage());
            throw new AuthException("JWT token is expired");
        } catch (UnsupportedJwtException ex) {
            log.error("JWT token is unsupported: {}", ex.getMessage());
            throw new AuthException("JWT token is unsupported");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
            throw new AuthException("JWT claims string is empty");
        } catch (Exception ex) {
            log.error("JWT token validation failed: {}", ex.getMessage());
            throw new AuthException("JWT token validation failed");
        }
    }

    @Override
    public String extractUsername(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (Exception ex) {
            log.error("Failed to extract username from token: {}", ex.getMessage());
            throw new AuthException("Failed to extract username from token");
        }
    }

    @Override
    public Long getExpirationTime() {
        return this.accessTokenExpiration;
    }

    @Override
    public Long getRefreshTokenExpirationTime() {
        return this.refreshTokenExpiration;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public Date extractExpiration(String token) {
        try {
            return extractAllClaims(token).getExpiration();
        } catch (Exception ex) {
            log.error("Failed to extract expiration from token: {}", ex.getMessage());
            throw new AuthException("Failed to extract expiration from token");
        }
    }

    @Override
    public Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception ex) {
            log.error("Failed to check token expiration: {}", ex.getMessage());
            return true;
        }
    }

    @Override
    public String generateRefreshTokenWithJti(UserDetails userDetails, String jti) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + (refreshTokenExpiration * 1000)); // Convert to milliseconds

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .id(jti)
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(getSigningKey())
                .compact();
    }

    @Override
    public String extractJti(String token) {
        try {
            return extractAllClaims(token).getId();
        } catch (Exception ex) {
            log.error("Failed to extract JTI from token: {}", ex.getMessage());
            throw new AuthException("Failed to extract JTI from token");
        }
    }

    @Override
    public Boolean validateRefreshToken(String refreshToken, UserDetails userDetails) {
        try {
            final String username = extractUsername(refreshToken);
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(refreshToken);
            log.debug("Refresh token validation result for user {}: {}", username, isValid);
            return isValid;
        } catch (Exception e) {
            log.error("Refresh token validation failed: {}", e.getMessage());
            return false;
        }
    }

    private Key getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception ex) {
            log.error("Failed to create signing key: {}", ex.getMessage());
            throw new AuthException("Failed to create JWT signing key");
        }
    }
}
