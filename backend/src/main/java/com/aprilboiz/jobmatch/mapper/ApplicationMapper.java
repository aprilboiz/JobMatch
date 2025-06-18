package com.aprilboiz.jobmatch.mapper;

import com.aprilboiz.jobmatch.dto.RoleDTO;
import com.aprilboiz.jobmatch.dto.response.*;
import com.aprilboiz.jobmatch.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.springframework.web.util.UriComponentsBuilder;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    @Mapping(source = "role", target = "role")
    @Mapping(target = "phoneNumber", expression = "java(getPhoneNumber(user))")
    UserResponse userToUserResponse(User user);

    @Mapping(source = "name", target = "roleName")
    RoleDTO roleToRoleDTO(Role role);

    @Mapping(source = "id", target = "id")
    @Mapping(target = "fileUri", expression = "java(getFileUri(cv))")
    CvResponse cvToCvResponse(CV cv);

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "recruiter.id", target = "recruiterId")
    JobResponse jobToJobResponse(Job job);

    @Mapping(source = "job.company.name", target = "companyName")
    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.title", target = "jobTitle")
    @Mapping(source = "createdAt", target = "appliedOn")
    ApplicationResponse applicationToApplicationResponse(Application application);

    @Mapping(source = "candidate.fullName", target = "candidateName")
    @Mapping(source = "candidate.user.email", target = "candidateEmail")
    @Mapping(source = "candidate.phoneNumber", target = "candidatePhoneNumber")
    @Mapping(source = "job.company.name", target = "companyName")
    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.title", target = "jobTitle")
    @Mapping(source = "createdAt", target = "appliedOn")
    @Mapping(source = "cv.fileName", target = "cvFileName")
    ApplicationDetailResponse applicationToApplicationDetailResponse(Application application);

    @Mapping(source = "name", target = "name")
    CompanyResponse companyToCompanyResponse(Company company);

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
