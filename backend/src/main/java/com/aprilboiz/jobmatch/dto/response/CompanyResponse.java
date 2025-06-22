package com.aprilboiz.jobmatch.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Company information response")
public class CompanyResponse {
    @Schema(description = "Company unique identifier", example = "1")
    private Long id;
    
    @Schema(description = "Company name", example = "aprilboiz Inc.")
    private String name;
    
    @Schema(description = "Company website", example = "https://aprilboiz.com")
    private String website;
    
    @Schema(description = "Company phone number", example = "0123456789")
    private String phoneNumber;
    
    @Schema(description = "Company email", example = "contact@aprilboiz.com")
    private String email;
    
    @Schema(description = "Company address", example = "123 Street 7, Ward 8, District 9")
    private String address;
    
    @Schema(description = "Company size", example = "50-100")
    private String companySize;
    
    @Schema(description = "Industry", example = "Technology")
    private String industry;
    
    @Schema(description = "Company description", example = "Leading technology company...")
    private String description;
    
    @Schema(description = "Company logo URL", example = "https://res.cloudinary.com/example/image/upload/v1234567890/logos/company-logo.jpg")
    private String logoUrl;
}
