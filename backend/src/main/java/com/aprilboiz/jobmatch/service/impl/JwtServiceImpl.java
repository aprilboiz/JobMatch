package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.service.JwtService;
import com.aprilboiz.jobmatch.service.MessageService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {
    
    private final MessageService messageService;
    
    @Value("${jwt.secret-key}")
    private String secretKey;
    
    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration; // seconds
    
    @Value("${jwt.refresh-token-expiration}")
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
            throw new BadCredentialsException(messageService.getMessage("auth.token.invalid"), ex);
        } catch (ExpiredJwtException ex) {
            log.error("JWT token is expired: {}", ex.getMessage());
            throw new CredentialsExpiredException(messageService.getMessage("auth.token.expired"), ex);
        } catch (UnsupportedJwtException ex) {
            log.error("JWT token is unsupported: {}", ex.getMessage());
            throw new BadCredentialsException(messageService.getMessage("auth.token.unsupported"), ex);
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
            throw new BadCredentialsException(messageService.getMessage("auth.token.claims.empty"), ex);
        } catch (Exception ex) {
            log.error("JWT token validation failed: {}", ex.getMessage());
            throw new AuthenticationException(messageService.getMessage("auth.token.validation.failed"), ex) {};
        }
    }

    @Override
    public String extractUsername(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException(messageService.getMessage("auth.extraction.failed", "username"), ex);
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
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException(messageService.getMessage("auth.extraction.failed", "expiration"), ex);
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
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException(messageService.getMessage("auth.extraction.failed", "JTI"), ex);
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
            throw new BadCredentialsException(messageService.getMessage("auth.signing.key.failed"), ex);
        }
    }
}
