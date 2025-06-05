package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.dto.UserDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class UpdateRecruiterRequest extends UserDTO {
    @NotBlank(message = "Full name is required!")
    @Size(min = 3, max = 50, message = "Full name must be between 3 and 50 characters!")
    private String fullName;
    
    @NotBlank(message = "Phone number is required!")
    @Size(min = 10, max = 10, message = "Phone number must be 10 digits!")
    private String phoneNumber;
}
