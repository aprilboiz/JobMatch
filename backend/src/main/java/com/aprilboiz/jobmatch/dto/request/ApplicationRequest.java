package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Schema(description = "Request object for submitting a job application")
public class ApplicationRequest {
    @Schema(
            description = "ID of the job position to apply for",
            example = "1"
    )
    @NotNull(message = "{" + ValidationMessages.JOB_ID_REQUIRED + "}")
    @Positive(message = "{" + ValidationMessages.ID_POSITIVE + "}")
    private Long jobId;
    
    @Schema(
            description = "ID of the CV to use for this application",
            example = "1"
    )
    @NotNull(message = "{" + ValidationMessages.CV_ID_REQUIRED + "}")
    @Positive(message = "{" + ValidationMessages.CV_ID_POSITIVE + "}")
    private Long cvId;

    @Schema(
            description = "Cover letter",
            example = "I am a software engineer with 5 years of experience in Java and Spring Boot"
    )
    private String coverLetter;
}
