package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.base.BaseProfileUpdateRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Candidate profile update request")
public class CandidateProfileUpdateRequest extends BaseProfileUpdateRequest {
    // Will be used in the future - not now
} 