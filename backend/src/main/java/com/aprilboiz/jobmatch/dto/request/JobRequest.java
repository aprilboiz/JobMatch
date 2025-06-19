package com.aprilboiz.jobmatch.dto.request;

import java.time.LocalDate;

import com.aprilboiz.jobmatch.dto.SalaryDto;
import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import com.aprilboiz.jobmatch.enumerate.JobType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
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
            maxLength = 100)
    @NotBlank(message = "{" + ValidationMessages.JOB_TITLE_REQUIRED + "}")
    @Size(max = 100, message = "{" + ValidationMessages.JOB_TITLE_SIZE + "}")
    private String title;
    
    @Schema(
            description = "Type of employment for the job position",
            example = "FULL_TIME"
    )
    @NotNull(message = "{" + ValidationMessages.JOB_TYPE_REQUIRED + "}")
    private JobType jobType;
    
    @Schema(description = "Salary information including type, range, and currency")
    @NotNull(message = "Salary information is required")
    @Valid
    private SalaryDto salary;
    
    @Schema(
            description = "Number of available positions for this job",
            example = "2"
    )
    @NotNull(message = "{" + ValidationMessages.JOB_OPENINGS_REQUIRED + "}")
    @Positive(message = "{" + ValidationMessages.POSITIVE + "}")
    private Integer openings;
    
    @Schema(
            description = "Last date to apply for the job",
            example = "2024-12-31"
    )
    @NotNull(message = "{" + ValidationMessages.JOB_DEADLINE_REQUIRED + "}")
    @Future(message = "{" + ValidationMessages.DEADLINE_FUTURE + "}")
    private LocalDate applicationDeadline;

    @Schema(
            description = "Detailed description of the job role and responsibilities",
            example = "We are looking for a Senior Software Engineer..."
    )
    @NotEmpty(message = "{" + ValidationMessages.JOB_DESCRIPTION_REQUIRED + "}")
    @Size(max = 5000, message = "{" + ValidationMessages.JOB_DESCRIPTION_SIZE + "}")
    private String description;

    @Schema(
            description = "Work location for the job",
            example = "San Francisco, CA, USA"
    )
    @NotEmpty(message = "{" + ValidationMessages.JOB_LOCATION_REQUIRED + "}")
    @Size(max = 100, message = "{" + ValidationMessages.JOB_LOCATION_SIZE + "}")
    private String location;
}
