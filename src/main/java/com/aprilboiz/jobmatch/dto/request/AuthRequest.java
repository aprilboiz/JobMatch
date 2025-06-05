package com.aprilboiz.jobmatch.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "Email is required!")
    @Email(message = "Email is invalid!")
    private String email;

    @NotBlank(message = "Password is required!")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters!")
    private String password;
}
