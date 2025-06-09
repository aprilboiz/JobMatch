package com.aprilboiz.jobmatch.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "User login request")
public class AuthRequest {
    @Schema(description = "User's email address", example = "john.doe@example.com")
    @NotBlank(message = "Email is required!")
    @Email(message = "Email is invalid!")
    private String email;

    @Schema(description = "User's password", example = "password123", minLength = 6, maxLength = 20)
    @NotBlank(message = "Password is required!")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters!")
    private String password;
}
