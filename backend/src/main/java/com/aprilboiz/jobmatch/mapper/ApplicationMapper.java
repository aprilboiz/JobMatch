package com.aprilboiz.jobmatch.mapper;

import com.aprilboiz.jobmatch.dto.RoleDTO;
import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.dto.response.UserResponse;
import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.springframework.web.util.UriComponentsBuilder;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    ApplicationMapper INSTANCE = Mappers.getMapper(ApplicationMapper.class);

    @Mapping(source = "role", target = "role")
    @Mapping(target = "phoneNumber", expression = "java(getPhoneNumber(user))")
    UserResponse userToUserResponse(User user);

    @Mapping(source = "name", target = "roleName")
    RoleDTO roleToRoleDTO(Role role);

    @Mapping(source = "id", target = "id")
    @Mapping(target = "fileUri", expression = "java(getFileUri(cv))")
    CvResponse cvToCvResponse(CV cv);

    default String getPhoneNumber(User user) {
        if (user.getCandidate() != null) {
            return user.getCandidate().getPhoneNumber();
        } else if (user.getRecruiter() != null) {
            return user.getRecruiter().getPhoneNumber();
        }
        return null;
    }

    default String getFileUri(CV cv) {
        return UriComponentsBuilder.fromPath("/api/me/cvs/{id}").buildAndExpand(cv.getId()).toUriString();
    }
}
