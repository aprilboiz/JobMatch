package com.aprilboiz.jobmatch.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyDTO {
    private Long id;
    @NotNull
    private String name;
    private String website;
    private String phoneNumber;
    private String email;
    @NotNull
    private String address;
    @NotNull
    private String companySize;
    @NotNull
    private String industry;
    private String description;
}
