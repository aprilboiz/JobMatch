package com.aprilboiz.jobmatch.dto.response;

import lombok.Data;

@Data
public class ApplicationResponse {
    private String id;
    private String jobId;
    private String jobTitle;
    private String companyName;
    private String status;
}
