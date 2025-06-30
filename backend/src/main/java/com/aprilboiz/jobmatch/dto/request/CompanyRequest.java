package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Company creation/update request")
public class CompanyRequest {
    @NotBlank(message = "{" + ValidationMessages.COMPANY_NAME_REQUIRED + "}")
    @Schema(description = "Company name", example = "aprilboiz Inc.")
    private String name;
    
    @Schema(description = "Company website", example = "https://aprilboiz.com")
    @Pattern(regexp = "^(https?://)?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/[a-zA-Z0-9.-/]*)?$", message = "{" + ValidationMessages.URL_INVALID + "}")
    private String website;
    
    @Schema(description = "Company phone number", example = "012345678")
    @Size(min = 10, max = 10, message = "{" + ValidationMessages.PHONE_SIZE + "}")
    private String phoneNumber;
    
    @Schema(description = "Company email", example = "contact@aprilboiz.com")
    @Email(message = "{" + ValidationMessages.EMAIL_INVALID + "}")
    private String email;
    
    @NotBlank(message = "{" + ValidationMessages.COMPANY_ADDRESS_REQUIRED + "}")
    @Schema(description = "Company address", example = "123 Street 7, Ward 8, District 9")
    private String address;
    
    @NotNull(message = "{" + ValidationMessages.COMPANY_SIZE_REQUIRED + "}")
    @Schema(description = "Company size", example = "50-100")
    private String companySize;
    
    @NotBlank(message = "{" + ValidationMessages.COMPANY_INDUSTRY_REQUIRED + "}")
    @Schema(description = "Industry", example = "Technology")
    private String industry;
    
    @Schema(description = "Company description", example = "Leading technology company...")
    private String description;
}
