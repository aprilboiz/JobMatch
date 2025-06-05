package com.aprilboiz.jobmatch.dto.response;

import com.aprilboiz.jobmatch.dto.RoleDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private RoleDTO role;
}
