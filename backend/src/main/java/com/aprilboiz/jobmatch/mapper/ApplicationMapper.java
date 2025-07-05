package com.aprilboiz.jobmatch.mapper;

import com.aprilboiz.jobmatch.dto.RoleDTO;
import com.aprilboiz.jobmatch.dto.SalaryDto;
import com.aprilboiz.jobmatch.dto.response.*;
import com.aprilboiz.jobmatch.model.JobCategory;
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

    @Mapping(source = "company.id", target = "company.id")
    @Mapping(source = "recruiter.id", target = "recruiterId")
    @Mapping(target = "salary", expression = "java(jobToSalaryDto(job))")
    @Mapping(target = "jobCategory", expression = "java(jobCategoryToCode(job.getJobCategory()))")
    JobResponse jobToJobResponse(Job job);

    @Mapping(source = "cv.id", target = "cvId")
    @Mapping(source = "candidate.id", target = "candidateId")
    @Mapping(source = "createdAt", target = "appliedDate")
    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.title", target = "jobTitle")
    @Mapping(source = "job.company.name", target = "companyName")
    ApplicationResponse applicationToApplicationResponse(Application application);

    @Mapping(source = "cv.id", target = "cvId")
    @Mapping(source = "createdAt", target = "appliedDate")
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
    
    default Integer jobCategoryToCode(JobCategory jobCategory) {
        return jobCategory != null ? jobCategory.getId() : null;
    }
}
