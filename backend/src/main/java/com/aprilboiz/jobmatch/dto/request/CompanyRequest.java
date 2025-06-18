package com.aprilboiz.jobmatch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRequest {
    @NotBlank(message = "Company name is required")
    private String name;
    private String website;
    private String phoneNumber;
    private String email;
    @NotBlank(message = "Company address is required")
    private String address;
    @NotNull(message = "Company size is required")
    private String companySize;
    @NotBlank(message = "Industry is required")
    private String industry;
    private String description;
}
