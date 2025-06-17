package com.aprilboiz.jobmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@SuperBuilder
public class ApplicationDetailResponse extends ApplicationResponse {
    private String candidateName;
    private String candidateEmail;
    private String candidatePhoneNumber;
    private String cvFileName;
}
