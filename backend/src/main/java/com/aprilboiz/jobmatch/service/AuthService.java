package com.aprilboiz.jobmatch.service;

import com.aprilboiz.jobmatch.dto.request.AuthRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest authRequest);
    void register(RegisterRequest registerRequest);
    AuthResponse refreshToken(String refreshToken);
    void logout(String accessToken, String refreshToken);
}
