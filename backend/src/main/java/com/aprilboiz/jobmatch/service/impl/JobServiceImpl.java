package com.aprilboiz.jobmatch.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
import com.aprilboiz.jobmatch.exception.DuplicateException;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.Job;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.repository.JobRepository;
import com.aprilboiz.jobmatch.service.JobService;

@Service
public class JobServiceImpl implements JobService{
    private final JobRepository jobRepository;
    private final ApplicationMapper applicationMapper;
    private final ApplicationService applicationService;
    private final MessageService messageService;

    public JobServiceImpl(JobRepository jobRepository, ApplicationMapper applicationMapper, 
                         ApplicationService applicationService, MessageService messageService) {
        this.jobRepository = jobRepository;
        this.applicationMapper = applicationMapper;
        this.applicationService = applicationService;
        this.messageService = messageService;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public JobResponse createJob(JobRequest jobRequest) {
        Optional<Job> existingJob = jobRepository.findByTitleIgnoreCase(jobRequest.getTitle());
        if (existingJob.isPresent()) {
            throw new DuplicateException(messageService.getMessage("error.duplicate.job.title", jobRequest.getTitle()));
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        Recruiter owner = userPrincipal.getUser().getRecruiter();
        Company ownerCompany = owner.getCompany();

        Job job = Job.builder()
            .title(jobRequest.getTitle())
            .jobType(jobRequest.getJobType())
            .salary(jobRequest.getSalary())
            .numberOfOpenings(jobRequest.getNumberOfOpenings())
            .applicationDeadline(jobRequest.getApplicationDeadline())
            .description(jobRequest.getDescription())
            .location(jobRequest.getLocation())
            .company(ownerCompany)
            .recruiter(owner)
            .build();

        return applicationMapper.jobToJobResponse(jobRepository.save(job));
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
    public JobResponse updateJob(Long id, JobRequest jobRequest) {
        Job job = jobRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.not.found.job", id)));

        if (!checkJobOwnership(job)) {
            throw new AccessDeniedException(messageService.getMessage("error.permission.job.update"));
        }

        job.setTitle(jobRequest.getTitle());
        job.setJobType(jobRequest.getJobType());
        job.setSalary(jobRequest.getSalary());
        job.setNumberOfOpenings(jobRequest.getNumberOfOpenings());
        job.setApplicationDeadline(jobRequest.getApplicationDeadline());
        job.setDescription(jobRequest.getDescription());
        job.setLocation(jobRequest.getLocation());
        return applicationMapper.jobToJobResponse(jobRepository.save(job));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.not.found.job", id)));

        if (!checkJobOwnership(job)) {
            throw new AccessDeniedException(messageService.getMessage("error.permission.job.delete"));
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
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Recruiter recruiter = userPrincipal.getUser().getRecruiter();
        if (recruiter == null) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        Job existingJob = jobRepository.findById(jobId).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.not.found.job", jobId)));
        if (!existingJob.getRecruiter().getId().equals(recruiter.getId()) && !existingJob.getCompany().getId().equals(recruiter.getCompany().getId())) {
            throw new AccessDeniedException(messageService.getMessage("error.permission.job.view"));
        }

        Page<ApplicationResponse> responses = applicationService.getAllApplications(existingJob, pageRequest);
        return new PageImpl<>(responses.getContent(), pageRequest, responses.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchAndFilterJobs(
            String keyword,
            JobType jobType,
            String location,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            String companyName,
            JobStatus status,
            LocalDate applicationDeadlineAfter,
            PageRequest pageRequest) {
        
        Page<Job> jobs = jobRepository.searchAndFilterJobs(
                keyword, jobType, location, minSalary, maxSalary, 
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

    private Boolean checkJobOwnership(Job job) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        Recruiter owner = userPrincipal.getUser().getRecruiter();
        Company ownerCompany = owner.getCompany();
        return job.getRecruiter().getId().equals(owner.getId()) || job.getCompany().getId().equals(ownerCompany.getId());
    }
}
