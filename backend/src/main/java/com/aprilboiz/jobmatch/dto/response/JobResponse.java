package com.aprilboiz.jobmatch.dto.response;

import java.time.LocalDate;
import java.util.List;

import com.aprilboiz.jobmatch.dto.SalaryDto;
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

    @Schema(description = "Job category code (1-24)", example = "5")
    private Integer jobCategory;
    
    @Schema(description = "Detailed job description", example = "We are looking for a Senior Software Engineer...")
    private String description;
    
    @Schema(description = "Job location", example = "San Francisco, CA, USA")
    private String location;
    
    @Schema(description = "List of required skills for the job position", example = "[\"Java\", \"Spring Boot\", \"REST APIs\", \"MySQL\", \"Git\"]")
    private List<String> skills;
    
    @Schema(description = "Salary information including type, range, and currency")
    private SalaryDto salary;
    
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
