package com.aprilboiz.jobmatch.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.aprilboiz.jobmatch.enumerate.JobType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Request object for creating or updating a job posting")
public class JobRequest {
    @Schema(
            description = "Job title or position name",
            example = "Senior Software Engineer",
            maxLength = 100
    )
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;
    
    @Schema(
            description = "Type of employment for the job position",
            example = "FULL_TIME",
            allowableValues = {"FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"}
    )
    @NotNull(message = "Job type is required")
    private JobType jobType;
    
    @Schema(
            description = "Salary offered for the position (in USD or local currency)",
            example = "75000.00",
            minimum = "0"
    )
    @NotNull(message = "Salary is required")
    @Positive(message = "Salary must be positive")
    private BigDecimal salary;
    
    @Schema(
            description = "Number of available positions for this job",
            example = "2",
            minimum = "1"
    )
    @NotNull(message = "Number of openings is required")
    @Positive(message = "Number of openings must be positive")
    private Integer numberOfOpenings;
    
    @Schema(
            description = "Last date for accepting applications (must be in the future)",
            example = "2024-12-31",
            format = "date"
    )
    @NotNull(message = "Application deadline is required")
    @Future(message = "Application deadline must be in the future")
    private LocalDate applicationDeadline;

    @Schema(
            description = "Detailed job description including responsibilities, requirements, and benefits",
            example = "We are looking for a Senior Software Engineer to join our team...",
            maxLength = 5000
    )
    @NotEmpty(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @Schema(
            description = "Job location (city, state/province, country or 'Remote')",
            example = "San Francisco, CA, USA",
            maxLength = 100
    )
    @NotEmpty(message = "Location is required")
    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;
}
