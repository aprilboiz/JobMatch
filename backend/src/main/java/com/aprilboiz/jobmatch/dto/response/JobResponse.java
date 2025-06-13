package com.aprilboiz.jobmatch.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private String title;
    private String jobType;
    private String description;
    private String location;
    private Double salary;
    private LocalDate applicationDeadline;
    private Integer numberOfOpenings;
    private String companyId;
    private String recruiterId;
}
