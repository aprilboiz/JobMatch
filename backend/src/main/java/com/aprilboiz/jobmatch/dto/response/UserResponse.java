package com.aprilboiz.jobmatch.dto.response;

import com.aprilboiz.jobmatch.dto.RoleDTO;
import com.fasterxml.jackson.annotation.JsonInclude;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "User information response")
public class UserResponse {
    @Schema(description = "User's unique identifier", example = "1")
    private Long id;
    
    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "User's full name", example = "John Doe")
    private String fullName;

    @Schema(description = "User's phone number", example = "1234567890")
    private String phoneNumber;
    
    @Schema(description = "User's avatar URL", example = "https://res.cloudinary.com/example/image/upload/v1234567890/avatars/user-avatar.jpg")
    private String avatarUrl;
    
    @Schema(description = "User's account status", example = "true")
    private Boolean isActive;

    @Schema(description = "User's role information")
    private RoleDTO role;
    
    @Schema(description = "User type (CANDIDATE, RECRUITER)", example = "CANDIDATE")
    private String userType;
}
