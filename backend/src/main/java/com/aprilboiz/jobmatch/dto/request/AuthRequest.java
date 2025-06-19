package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "User login request")
public class AuthRequest {
    @Schema(description = "User's email address", example = "john.doe@example.com")
    @NotBlank(message = "{" + ValidationMessages.EMAIL_REQUIRED + "}")
    @Email(message = "{" + ValidationMessages.EMAIL_INVALID + "}")
    private String email;

    @Schema(description = "User's password", example = "password123", minLength = 6, maxLength = 20)
    @NotBlank(message = "{" + ValidationMessages.PASSWORD_REQUIRED + "}")
    @Size(min = 6, max = 20, message = "{" + ValidationMessages.PASSWORD_SIZE + "}")
    private String password;
}
