package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.request.AuthRequest;
import com.aprilboiz.jobmatch.dto.request.LogoutRequest;
import com.aprilboiz.jobmatch.dto.request.RefreshTokenRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.dto.response.AuthResponse;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.service.AuthService;
import com.aprilboiz.jobmatch.service.JwtService;
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

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final UserService userService;
    private final TokenBlacklistService tokenBlacklistService;
    private final ApplicationMapper appMapper;

    public AuthServiceImpl(JwtService jwtService, AuthenticationManager authManager, 
                          UserService userService, TokenBlacklistService tokenBlacklistService,
                          ApplicationMapper userMapper) {
        this.jwtService = jwtService;
        this.authManager = authManager;
        this.userService = userService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.appMapper = userMapper;
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

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userPrincipal.getUser();

            String accessToken = jwtService.generateAccessToken(userPrincipal);
            String refreshToken = jwtService.generateRefreshToken(userPrincipal);

            return AuthResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .user(appMapper.userToUserResponse(user))
                    .expiresIn(jwtService.getExpirationTime())
                    .build();
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password.");
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
                throw new BadCredentialsException("Refresh token has been invalidated");
            }
            
            if (!jwtService.validateToken(refreshToken)) {
                throw new BadCredentialsException("Invalid refresh token");
            }
            
            String username = jwtService.extractUsername(refreshToken);
            UserDetails userDetails = userService.loadUserByUsername(username);
            
            if (!jwtService.validateRefreshToken(refreshToken, userDetails)) {
                throw new BadCredentialsException("Invalid refresh token");
            }
            
            String newAccessToken = jwtService.generateAccessToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);
            
            Duration timeToLive = Duration.ofSeconds(jwtService.getRefreshTokenExpirationTime());
            tokenBlacklistService.blacklistToken(refreshToken, timeToLive);
            
            User user = ((UserPrincipal) userDetails).getUser();
            
            log.info("Refresh token successful for user: {}", username);
            
            return AuthResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .user(appMapper.userToUserResponse(user))
                    .expiresIn(jwtService.getExpirationTime())
                    .build();
                    
        } catch (Exception ex) {
            log.error("Refresh token failed", ex);
            throw new BadCredentialsException("Invalid refresh token");
        }
    }

    @Override
    public void logout(LogoutRequest logoutRequest) {
        try {
            String accessToken = logoutRequest.getAccessToken();
            String refreshToken = logoutRequest.getRefreshToken();
            
            Duration accessTokenTtl = Duration.ofSeconds(jwtService.getExpirationTime());
            Duration refreshTokenTtl = Duration.ofSeconds(jwtService.getRefreshTokenExpirationTime());
            
            tokenBlacklistService.blacklistToken(accessToken, accessTokenTtl);
            tokenBlacklistService.blacklistToken(refreshToken, refreshTokenTtl);
            
            log.info("User logout successful - both access and refresh tokens blacklisted");
            
        } catch (Exception ex) {
            log.error("Logout failed", ex);
            throw new RuntimeException("Logout failed", ex);
        }
    }
}

