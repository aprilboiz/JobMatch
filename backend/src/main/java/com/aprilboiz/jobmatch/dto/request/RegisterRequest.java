package com.aprilboiz.jobmatch.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required!")
    @Size(min = 3, max = 50, message = "Full name must be between 3 and 50 characters!")
    private String fullName;
    
    @NotBlank(message = "Email is required!")
    @Email(message = "Invalid email address!")
    private String email;
    
    @NotBlank(message = "Phone number is required!")
    @Size(min=10, max=10, message = "Phone number must be 10 digits!")
    private String phoneNumber;
    
    @NotBlank(message = "Password is required!")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters!")
    private String password;

    @NotBlank(message = "Role is required!")
    private String role;
}
