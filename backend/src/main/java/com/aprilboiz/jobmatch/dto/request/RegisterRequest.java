package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "User registration request")
public class RegisterRequest {
    @Schema(description = "User's full name", example = "John Doe", minLength = 3, maxLength = 50)
    @NotBlank(message = "{" + ValidationMessages.FULLNAME_REQUIRED + "}")
    @Size(min = 3, max = 50, message = "{" + ValidationMessages.FULLNAME_SIZE + "}")
    private String fullName;
    
    @Schema(description = "User's email address", example = "john.doe@example.com")
    @NotBlank(message = "{" + ValidationMessages.EMAIL_REQUIRED + "}")
    @Email(message = "{" + ValidationMessages.EMAIL_INVALID + "}")
    private String email;
    
    @Schema(description = "User's phone number (10 digits)", example = "1234567890", minLength = 10, maxLength = 10)
    @NotBlank(message = "{" + ValidationMessages.PHONE_REQUIRED + "}")
    @Size(min=10, max=10, message = "{" + ValidationMessages.PHONE_SIZE + "}")
    private String phoneNumber;
    
    @Schema(description = "User's password", example = "password123", minLength = 6, maxLength = 20)
    @NotBlank(message = "{" + ValidationMessages.PASSWORD_REQUIRED + "}")
    @Size(min = 6, max = 20, message = "{" + ValidationMessages.PASSWORD_SIZE + "}")
    private String password;

    @Schema(description = "User's role", example = "CANDIDATE", allowableValues = {"CANDIDATE", "RECRUITER", "ADMIN"})
    @NotBlank(message = "{" + ValidationMessages.ROLE_REQUIRED + "}")
    private String role;
}
