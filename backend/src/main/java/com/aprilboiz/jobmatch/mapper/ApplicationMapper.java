package com.aprilboiz.jobmatch.mapper;

import com.aprilboiz.jobmatch.dto.RoleDTO;
import com.aprilboiz.jobmatch.dto.SalaryDto;
import com.aprilboiz.jobmatch.dto.response.*;
import com.aprilboiz.jobmatch.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.web.util.UriComponentsBuilder;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    @Mapping(source = "role", target = "role")
    @Mapping(source = "phoneNumber", target = "phoneNumber")
    @Mapping(target = "userType", expression = "java(getUserType(user))")
    @Mapping(target = "company", expression = "java(getCompanyResponse(user))")
    UserResponse userToUserResponse(User user);

    @Mapping(source = "name", target = "roleName")
    RoleDTO roleToRoleDTO(Role role);

    @Mapping(source = "id", target = "id")
    @Mapping(target = "fileUri", expression = "java(getFileUri(cv))")
    CvResponse cvToCvResponse(CV cv);

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "recruiter.id", target = "recruiterId")
    @Mapping(target = "salary", expression = "java(jobToSalaryDto(job))")
    JobResponse jobToJobResponse(Job job);

    @Mapping(source = "job.company.name", target = "companyName")
    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.title", target = "jobTitle")
    @Mapping(source = "createdAt", target = "appliedOn")
    ApplicationResponse applicationToApplicationResponse(Application application);

    @Mapping(source = "candidate.fullName", target = "candidateName")
    @Mapping(source = "candidate.email", target = "candidateEmail")
    @Mapping(source = "candidate.phoneNumber", target = "candidatePhoneNumber")
    @Mapping(source = "job.company.name", target = "companyName")
    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.title", target = "jobTitle")
    @Mapping(source = "createdAt", target = "appliedOn")
    @Mapping(source = "cv.fileName", target = "cvFileName")
    ApplicationDetailResponse applicationToApplicationDetailResponse(Application application);

    @Mapping(source = "name", target = "name")
    CompanyResponse companyToCompanyResponse(Company company);

    default String getFileUri(CV cv) {
        return UriComponentsBuilder.fromPath("/api/cvs/{id}").buildAndExpand(cv.getId()).toUriString();
    }
    
    default String getUserType(User user) {
        if (user instanceof Candidate) {
            return "CANDIDATE";
        } else if (user instanceof Recruiter) {
            return "RECRUITER";
        }
        return "USER";
    }
    
    default SalaryDto jobToSalaryDto(Job job) {
        if (job == null) {
            return null;
        }
        
        return SalaryDto.builder()
                .salaryType(job.getSalaryType())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .currency(job.getCurrency())
                .salaryPeriod(job.getSalaryPeriod())
                .build();
    }
    
    default CompanyResponse getCompanyResponse(User user) {
        if (user instanceof Recruiter recruiter && recruiter.getCompany() != null) {
            return companyToCompanyResponse(recruiter.getCompany());
        }
        return null;
    }
}
