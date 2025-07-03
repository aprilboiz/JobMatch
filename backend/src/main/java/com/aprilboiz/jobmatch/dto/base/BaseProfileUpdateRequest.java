package com.aprilboiz.jobmatch.dto.base;

import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Base profile update request")
public abstract class BaseProfileUpdateRequest {
    @Schema(description = "User's full name", example = "John Doe", minLength = 3, maxLength = 50)
    @NotBlank(message = "{" + ValidationMessages.FULLNAME_REQUIRED + "}")
    @Size(min = 3, max = 50, message = "{" + ValidationMessages.FULLNAME_SIZE + "}")
    private String fullName;
    
    @Schema(description = "User's phone number (10 digits)", example = "1234567890", minLength = 10, maxLength = 10)
    @NotBlank(message = "{" + ValidationMessages.PHONE_REQUIRED + "}")
    @Size(min = 10, max = 10, message = "{" + ValidationMessages.PHONE_SIZE + "}")
    private String phoneNumber;
    
    @Schema(description = "Company ID (required for recruiters, ignored for candidates)", example = "1")
    private Long companyId;
} 