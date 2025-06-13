package com.aprilboiz.jobmatch.dto.request;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Job type is required")
    private String jobType;
    
    @NotNull(message = "Salary is required")
    private Double salary;
    
    @NotNull(message = "Number of openings is required")
    private Integer numberOfOpenings;
    
    @NotNull(message = "Application deadline is required")
    private LocalDate applicationDeadline;

    @NotEmpty(message = "Description is required")
    private String description;

    @NotEmpty(message = "Location is required")
    private String location;
}
