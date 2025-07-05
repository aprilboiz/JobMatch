package com.aprilboiz.jobmatch.dto.response;

import java.time.LocalDate;

import com.aprilboiz.jobmatch.enumerate.ApplicationStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Schema(description = "Application information response")
public class ApplicationResponse {
    @Schema(description = "Unique identifier for the application", example = "1")
    private Long id;

    @Schema(description = "Job information", example = "Job information")
    private Long jobId;

    @Schema(description = "CV information", example = "CV information")
    private Long cvId;

    @Schema(description = "Candidate information", example = "Candidate information")
    private Long candidateId;

    @Schema(description = "Job title", example = "Software Engineer")
    private String jobTitle;

    @Schema(description = "Company information", example = "Company information")
    private String companyName;

    @Schema(description = "Application status", example = "PENDING")
    private ApplicationStatus status;

    @Schema(description = "Date of application", example = "2024-01-01")
    private LocalDate appliedDate;
}
