package com.aprilboiz.jobmatch.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public JobServiceImpl(JobRepository jobRepository, ApplicationMapper applicationMapper) {
        this.jobRepository = jobRepository;
        this.applicationMapper = applicationMapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public JobResponse createJob(JobRequest jobRequest) {
        Optional<Job> existingJob = jobRepository.findByTitle(jobRequest.getTitle());
        if (existingJob.isPresent()) {
            throw new DuplicateException("Job with title " + jobRequest.getTitle() + " already exists");
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
            .company(ownerCompany)
            .recruiter(owner)
            .build();

        return applicationMapper.jobToJobResponse(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJob(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new NotFoundException("Job with id " + id + " not found"));
        return applicationMapper.jobToJobResponse(job);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public JobResponse updateJob(Long id, JobRequest jobRequest) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new NotFoundException("Job with id " + id + " not found"));

        if (!checkJobOwnership(job)) {
            throw new AccessDeniedException("You are not allowed to update this job");
        }

        job.setTitle(jobRequest.getTitle());
        job.setJobType(jobRequest.getJobType());
        job.setSalary(jobRequest.getSalary());
        job.setNumberOfOpenings(jobRequest.getNumberOfOpenings());
        job.setApplicationDeadline(jobRequest.getApplicationDeadline());
        job.setDescription(jobRequest.getDescription());
        return applicationMapper.jobToJobResponse(jobRepository.save(job));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new NotFoundException("Job with id " + id + " not found"));

        if (!checkJobOwnership(job)) {
            throw new AccessDeniedException("You are not allowed to delete this job");
        }

        jobRepository.delete(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll().stream().map(applicationMapper::jobToJobResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getJobApplications(Long id) {
        // TODO: Implement this method
        throw new UnsupportedOperationException("Unimplemented method 'getJobApplications'");
    }

    private Boolean checkJobOwnership(Job job) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        Recruiter owner = userPrincipal.getUser().getRecruiter();
        Company ownerCompany = owner.getCompany();
        return job.getRecruiter().getId().equals(owner.getId()) || job.getCompany().getId().equals(ownerCompany.getId());
    }

}
