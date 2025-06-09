package com.aprilboiz.jobmatch.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "User registration request")
public class RegisterRequest {
    @Schema(description = "User's full name", example = "John Doe", minLength = 3, maxLength = 50)
    @NotBlank(message = "Full name is required!")
    @Size(min = 3, max = 50, message = "Full name must be between 3 and 50 characters!")
    private String fullName;
    
    @Schema(description = "User's email address", example = "john.doe@example.com")
    @NotBlank(message = "Email is required!")
    @Email(message = "Invalid email address!")
    private String email;
    
    @Schema(description = "User's phone number (10 digits)", example = "1234567890", minLength = 10, maxLength = 10)
    @NotBlank(message = "Phone number is required!")
    @Size(min=10, max=10, message = "Phone number must be 10 digits!")
    private String phoneNumber;
    
    @Schema(description = "User's password", example = "password123", minLength = 6, maxLength = 20)
    @NotBlank(message = "Password is required!")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters!")
    private String password;

    @Schema(description = "User's role", example = "CANDIDATE", allowableValues = {"CANDIDATE", "RECRUITER", "ADMIN"})
    @NotBlank(message = "Role is required!")
    private String role;
}
