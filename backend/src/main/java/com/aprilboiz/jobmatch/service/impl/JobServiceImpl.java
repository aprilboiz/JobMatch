package com.aprilboiz.jobmatch.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.aprilboiz.jobmatch.dto.SalaryDto;
import com.aprilboiz.jobmatch.enumerate.JobStatus;
import com.aprilboiz.jobmatch.enumerate.JobType;
import com.aprilboiz.jobmatch.service.ApplicationService;
import com.aprilboiz.jobmatch.service.MessageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aprilboiz.jobmatch.dto.request.JobRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.dto.response.JobResponse;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.*;
import com.aprilboiz.jobmatch.repository.JobRepository;
import com.aprilboiz.jobmatch.repository.JobCategoryRepository;
import com.aprilboiz.jobmatch.service.JobService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {
    private final JobRepository jobRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final ApplicationMapper applicationMapper;
    private final ApplicationService applicationService;
    private final MessageService messageService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public JobResponse createJob(JobRequest jobRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) auth.getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter owner)) {
            throw new SecurityException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        Company ownerCompany = owner.getCompany();
        SalaryDto salaryDto = jobRequest.getSalary();
        
        JobCategory jobCategory = jobCategoryRepository.findById(jobRequest.getJobCategory())
                .orElseThrow(() -> new IllegalArgumentException("Invalid job category ID: " + jobRequest.getJobCategory()));

        Job newJob = Job.builder()
                .title(jobRequest.getTitle())
                .description(jobRequest.getDescription())
                .location(jobRequest.getLocation())
                .salaryType(salaryDto.getSalaryType())
                .minSalary(calculateMinSalary(salaryDto))
                .maxSalary(calculateMaxSalary(salaryDto))
                .currency(salaryDto.getCurrency())
                .salaryPeriod(salaryDto.getSalaryPeriod())
                .jobType(jobRequest.getJobType())
                .jobCategory(jobCategory)
                .numberOfOpenings(jobRequest.getOpenings())
                .applicationDeadline(jobRequest.getApplicationDeadline())
                .recruiter(owner)
                .company(ownerCompany)
                .build();

        jobRepository.save(newJob);

        return applicationMapper.jobToJobResponse(newJob);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJob(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.not.found.job", id)));
        return applicationMapper.jobToJobResponse(job);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public JobResponse updateJob(Long jobId, JobRequest jobRequest) {
        Job existingJob = jobRepository.findById(jobId)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.job", jobId)));

        if (!isUserCanModifyJob(existingJob)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.job.modify"));
        }

        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter recruiter)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        if (!existingJob.getRecruiter().getId().equals(recruiter.getId()) && !existingJob.getCompany().getId().equals(recruiter.getCompany().getId())) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.job.modify"));
        }

        SalaryDto salaryDto = jobRequest.getSalary();
        
        JobCategory jobCategory = jobCategoryRepository.findById(jobRequest.getJobCategory())
                .orElseThrow(() -> new IllegalArgumentException("Invalid job category ID: " + jobRequest.getJobCategory()));
        
        existingJob.setTitle(jobRequest.getTitle());
        existingJob.setJobType(jobRequest.getJobType());
        existingJob.setJobCategory(jobCategory);
        existingJob.setSalaryType(salaryDto.getSalaryType());
        existingJob.setMinSalary(calculateMinSalary(salaryDto));
        existingJob.setMaxSalary(calculateMaxSalary(salaryDto));
        existingJob.setCurrency(salaryDto.getCurrency());
        existingJob.setSalaryPeriod(salaryDto.getSalaryPeriod());
        existingJob.setNumberOfOpenings(jobRequest.getOpenings());
        existingJob.setApplicationDeadline(jobRequest.getApplicationDeadline());
        existingJob.setDescription(jobRequest.getDescription());
        existingJob.setLocation(jobRequest.getLocation());
        return applicationMapper.jobToJobResponse(jobRepository.save(existingJob));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.not.found.job", id)));

        if (!isUserCanModifyJob(job)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.job.modify"));
        }

        jobRepository.delete(job);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getAllJobs(PageRequest pageRequest) {
        Page<Job> jobs = jobRepository.findAll(pageRequest);
        List<JobResponse> jobResponses = jobs.getContent().stream().map(applicationMapper::jobToJobResponse).toList();
        return new PageImpl<>(jobResponses, pageRequest, jobs.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getJobsByRecruiter(Recruiter recruiter, PageRequest pageRequest) {
        Page<Job> jobs = jobRepository.findAllByRecruiter(recruiter, pageRequest);
        List<JobResponse> jobResponses = jobs.getContent().stream().map(applicationMapper::jobToJobResponse).toList();
        return new PageImpl<>(jobResponses, pageRequest, jobs.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getJobsByCompany(Company company, PageRequest pageRequest) {
        Page<Job> jobs = jobRepository.findAllByCompany(company, pageRequest);
        List<JobResponse> jobResponses = jobs.getContent().stream().map(applicationMapper::jobToJobResponse).toList();
        return new PageImpl<>(jobResponses, pageRequest, jobs.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getJobApplications(Long jobId, PageRequest pageRequest) {
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter recruiter)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        Job existingJob = jobRepository.findById(jobId).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.not.found.job", jobId)));
        if (!existingJob.getRecruiter().getId().equals(recruiter.getId()) && !existingJob.getCompany().getId().equals(recruiter.getCompany().getId())) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.job.view"));
        }

        Page<ApplicationResponse> responses = applicationService.getAllApplications(existingJob, pageRequest);
        return new PageImpl<>(responses.getContent(), pageRequest, responses.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchAndFilterJobs(
            String keyword,
            JobType jobType,
            Integer jobCategory,
            String location,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            String companyName,
            JobStatus status,
            LocalDate applicationDeadlineAfter,
            PageRequest pageRequest) {
        
        Page<Job> jobs = jobRepository.searchAndFilterJobs(
                keyword, jobType, jobCategory, location, minSalary, maxSalary, 
                companyName, status, applicationDeadlineAfter, pageRequest);
        
        List<JobResponse> jobResponses = jobs.getContent().stream()
                .map(applicationMapper::jobToJobResponse)
                .toList();
        
        return new PageImpl<>(jobResponses, pageRequest, jobs.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctLocations() {
        return jobRepository.findDistinctLocations();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctCompanyNames() {
        return jobRepository.findDistinctCompanyNames();
    }

    /**
     * Calculate minimum salary based on salary type
     */
    private BigDecimal calculateMinSalary(SalaryDto salaryDto) {
        return switch (salaryDto.getSalaryType()) {
            case FIXED, RANGE -> salaryDto.getMinSalary();
            case NEGOTIABLE, COMPETITIVE -> null;
        };
    }

    /**
     * Calculate maximum salary based on salary type
     */
    private BigDecimal calculateMaxSalary(SalaryDto salaryDto) {
        return switch (salaryDto.getSalaryType()) {
            case FIXED -> salaryDto.getMinSalary(); // For fixed salary, max = min
            case RANGE -> salaryDto.getMaxSalary();
            case NEGOTIABLE, COMPETITIVE -> null;
        };
    }

    private boolean isUserCanModifyJob(Job job) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) auth.getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter owner)) {
            return false;
        }
        Company ownerCompany = owner.getCompany();
        return job.getRecruiter().getId().equals(owner.getId()) || job.getCompany().getId().equals(ownerCompany.getId());
    }
}
