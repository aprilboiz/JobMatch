package com.aprilboiz.jobmatch.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Schema(description = "Request object for submitting a job application")
public class ApplicationRequest {
    @Schema(
            description = "ID of the job position to apply for",
            example = "1",
            required = true
    )
    @NotNull(message = "Job ID is required")
    @Positive(message = "Job ID must be positive")
    private Long jobId;
    
    @Schema(
            description = "ID of the CV to use for this application",
            example = "1",
            required = true
    )
    @NotNull(message = "CV ID is required")
    @Positive(message = "CV ID must be positive")
    private Long cvId;
}
