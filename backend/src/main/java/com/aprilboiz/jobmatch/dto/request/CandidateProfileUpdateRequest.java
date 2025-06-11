package com.aprilboiz.jobmatch.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Candidate profile update request")
public class CandidateProfileUpdateRequest {
    @Schema(description = "Candidate's full name", example = "John Doe", minLength = 3, maxLength = 50)
    @NotBlank(message = "Full name is required!")
    @Size(min = 3, max = 50, message = "Full name must be between 3 and 50 characters!")
    private String fullName;
    
    @Schema(description = "Candidate's phone number (10 digits)", example = "1234567890", minLength = 10, maxLength = 10)
    @NotBlank(message = "Phone number is required!")
    @Size(min = 10, max = 10, message = "Phone number must be 10 digits!")
    private String phoneNumber;
} 