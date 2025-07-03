package com.aprilboiz.jobmatch.service;

import com.aprilboiz.jobmatch.dto.request.CandidateProfileUpdateRequest;
import com.aprilboiz.jobmatch.dto.request.RecruiterProfileUpdateRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.dto.base.BaseProfileUpdateRequest;
import com.aprilboiz.jobmatch.dto.response.UserResponse;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {
    void createUser(RegisterRequest registerRequest);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
    UserResponse updateProfile(String email, CandidateProfileUpdateRequest profileRequest);
    UserResponse updateProfile(String email, RecruiterProfileUpdateRequest profileRequest);
    UserResponse updateProfile(String email, BaseProfileUpdateRequest profileRequest);
    void updateUserAvatar(Long userId, String avatarUrl);
}
