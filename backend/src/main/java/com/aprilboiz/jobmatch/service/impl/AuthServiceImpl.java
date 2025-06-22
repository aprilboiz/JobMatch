package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.request.AuthRequest;
import com.aprilboiz.jobmatch.dto.request.LogoutRequest;
import com.aprilboiz.jobmatch.dto.request.RefreshTokenRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.dto.response.AuthResponse;
import com.aprilboiz.jobmatch.model.UserPrincipalAdapter;
import com.aprilboiz.jobmatch.service.AuthService;
import com.aprilboiz.jobmatch.service.JwtService;
import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.service.TokenBlacklistService;
import com.aprilboiz.jobmatch.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final UserService userService;
    private final TokenBlacklistService tokenBlacklistService;
    private final MessageService messageService;

    public AuthServiceImpl(JwtService jwtService, AuthenticationManager authManager, 
                          UserService userService, TokenBlacklistService tokenBlacklistService,
                          MessageService messageService) {
        this.jwtService = jwtService;
        this.authManager = authManager;
        this.userService = userService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.messageService = messageService;
    }

    @Override
    public AuthResponse login(AuthRequest authRequest) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) authentication.getPrincipal();

            String accessToken = jwtService.generateAccessToken(userPrincipalAdapter);
            String refreshToken = jwtService.generateRefreshToken(userPrincipalAdapter);

            return AuthResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .build();
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException(messageService.getMessage("api.error.invalid.credentials"));
        }
    }


    @Override
    public void register(RegisterRequest registerRequest) {
        userService.createUser(registerRequest);
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();
            
            if (tokenBlacklistService.isTokenBlacklisted(refreshToken)) {
                throw new BadCredentialsException(messageService.getMessage("auth.refresh.invalidated"));
            }
            
            if (!jwtService.validateToken(refreshToken)) {
                throw new BadCredentialsException(messageService.getMessage("auth.refresh.invalid"));
            }
            
            String username = jwtService.extractUsername(refreshToken);
            UserDetails userDetails = userService.loadUserByUsername(username);
            
            if (!jwtService.validateRefreshToken(refreshToken, userDetails)) {
                throw new BadCredentialsException(messageService.getMessage("auth.refresh.invalid"));
            }
            
            String newAccessToken = jwtService.generateAccessToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);
            
            Duration timeToLive = Duration.ofSeconds(jwtService.getRefreshTokenExpirationTime());
            tokenBlacklistService.blacklistToken(refreshToken, timeToLive);
            
            log.info("Refresh token successful for user: {}", username);
            
            return AuthResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .build();
                    
        } catch (Exception ex) {
            log.error("Refresh token failed", ex);
            throw new BadCredentialsException(ex.getMessage());
        }
    }

    @Override
    public void logout(LogoutRequest logoutRequest) {
        try {
            String accessToken = logoutRequest.getToken();
            String refreshToken = logoutRequest.getRefreshToken();
            
            Duration accessTokenTtl = Duration.ofSeconds(jwtService.getExpirationTime());
            Duration refreshTokenTtl = Duration.ofSeconds(jwtService.getRefreshTokenExpirationTime());
            
            tokenBlacklistService.blacklistToken(accessToken, accessTokenTtl);
            tokenBlacklistService.blacklistToken(refreshToken, refreshTokenTtl);
            
            log.info("User logout successful - both access and refresh tokens blacklisted");
            
        } catch (Exception ex) {
            log.error("Logout failed", ex);
            throw new RuntimeException(messageService.getMessage("auth.logout.failed"), ex);
        }
    }
}

