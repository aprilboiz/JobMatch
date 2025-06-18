package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.exception.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aprilboiz.jobmatch.dto.request.CandidateProfileUpdateRequest;
import com.aprilboiz.jobmatch.dto.request.RecruiterProfileUpdateRequest;
import com.aprilboiz.jobmatch.dto.response.UserResponse;
import com.aprilboiz.jobmatch.service.impl.UserServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/me")
@Tag(name = "User Management", description = "Operations for managing user profiles and information")
public class UserController {
    private final UserServiceImpl userService;

    public UserController(UserServiceImpl userService) {
        this.userService = userService;
    }

    @Operation(
            summary = "Get User Profile",
            description = "Retrieve the authenticated user's profile information.",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User found successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token")
    })
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
            summary = "Update Candidate Profile",
            description = "Update the profile information for an authenticated candidate user.",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not a candidate"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/profile/candidate")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<UserResponse>> updateCandidateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CandidateProfileUpdateRequest profileRequest) {
        UserResponse response = userService.updateProfile(userDetails.getUsername(), profileRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(
            summary = "Update Recruiter Profile",
            description = "Update the profile information for an authenticated recruiter user.",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not a recruiter"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/profile/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<UserResponse>> updateRecruiterProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RecruiterProfileUpdateRequest profileRequest) {
        UserResponse response = userService.updateProfile(userDetails.getUsername(), profileRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
