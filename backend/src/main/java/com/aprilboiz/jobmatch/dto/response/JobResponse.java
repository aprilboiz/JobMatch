package com.aprilboiz.jobmatch.dto.response;

import java.time.LocalDate;

import com.aprilboiz.jobmatch.enumerate.JobStatus;
import com.aprilboiz.jobmatch.enumerate.JobType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Job posting information response")
public class JobResponse {
    @Schema(description = "Unique identifier for the job", example = "1")
    private Long id;
    
    @Schema(description = "Job title or position name", example = "Senior Software Engineer")
    private String title;
    
    @Schema(description = "Type of employment", example = "FULL_TIME")
    private JobType jobType;
    
    @Schema(description = "Detailed job description", example = "We are looking for a Senior Software Engineer...")
    private String description;
    
    @Schema(description = "Job location", example = "San Francisco, CA, USA")
    private String location;
    
    @Schema(description = "Salary offered for the position", example = "75000.0")
    private Double salary;
    
    @Schema(description = "Application deadline", example = "2024-12-31")
    private LocalDate applicationDeadline;
    
    @Schema(description = "Number of available positions", example = "2")
    private Integer numberOfOpenings;
    
    @Schema(description = "Company identifier", example = "1")
    private String companyId;
    
    @Schema(description = "Recruiter identifier", example = "1")
    private String recruiterId;
    
    @Schema(description = "Current status of the job posting", example = "ACTIVE")
    private JobStatus status;
}
