package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.base.BaseProfileUpdateRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Recruiter profile update request")
public class RecruiterProfileUpdateRequest extends BaseProfileUpdateRequest {
    // All fields are now inherited from BaseProfileUpdateRequest
    // companyId is now in the base class and can be used by recruiters
} 