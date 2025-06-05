package com.aprilboiz.jobmatch.mapper;

import com.aprilboiz.jobmatch.dto.RoleDTO;
import com.aprilboiz.jobmatch.dto.response.UserResponse;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(source = "role", target = "role")
    UserResponse userToUserResponse(User user);
    
    User userResponseToUser(UserResponse userResponse);
    
    @Mapping(source = "name", target = "roleName")
    RoleDTO roleToRoleDTO(Role role);
}
