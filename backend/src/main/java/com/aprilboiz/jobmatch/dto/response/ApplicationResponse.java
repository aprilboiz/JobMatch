package com.aprilboiz.jobmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ApplicationResponse {
    private String id;
    private String jobId;
    private String jobTitle;
    private String companyName;
    private String status;
    private String appliedOn;
}
