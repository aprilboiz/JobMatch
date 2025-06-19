package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.base.BaseProfileUpdateRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Recruiter profile update request")
public class RecruiterProfileUpdateRequest extends BaseProfileUpdateRequest {
    @Schema(description = "Company ID", example = "1")
    private Long companyId;
} 