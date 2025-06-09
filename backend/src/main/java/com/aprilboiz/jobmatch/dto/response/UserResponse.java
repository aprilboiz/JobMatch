package com.aprilboiz.jobmatch.dto.response;

import com.aprilboiz.jobmatch.dto.RoleDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User information response")
public class UserResponse {
    @Schema(description = "User's unique identifier", example = "1")
    private Long id;
    
    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "User's role information")
    private RoleDTO role;
}
