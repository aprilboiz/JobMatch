package com.aprilboiz.jobmatch.dto.response;

import java.time.LocalDate;

import com.aprilboiz.jobmatch.enumerate.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;

@Data
@AllArgsConstructor
@Builder
public class ApplicationDetailResponse{
    private Long id;
    private Long cvId;
    private JobResponse job;
    private UserResponse candidate;
    private ApplicationStatus status;
    private LocalDate appliedDate;
    private String coverLetter;
    private AnalysisResponse analysis;
}
