package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.request.ApplicationRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.enumerate.ApplicationStatus;
import com.aprilboiz.jobmatch.enumerate.JobStatus;
import com.aprilboiz.jobmatch.exception.DuplicateException;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.*;
import com.aprilboiz.jobmatch.repository.ApplicationRepository;
import com.aprilboiz.jobmatch.repository.CvRepository;
import com.aprilboiz.jobmatch.repository.JobRepository;
import com.aprilboiz.jobmatch.service.ApplicationService;
import com.aprilboiz.jobmatch.service.MessageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CvRepository cvRepository;
    private final ApplicationMapper appMapper;
    private final MessageService messageService;

    public ApplicationServiceImpl(ApplicationRepository applicationRepository, JobRepository jobRepository,
            CvRepository cvRepository, ApplicationMapper appMapper, MessageService messageService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.cvRepository = cvRepository;
        this.appMapper = appMapper;
        this.messageService = messageService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getAllApplications(PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAll(pageRequest);
        List<ApplicationResponse> responses = applications.getContent().stream()
                .map(appMapper::applicationToApplicationResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getAllApplications(Job job, PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAllByJob(job, pageRequest);
        List<ApplicationResponse> responses = applications.getContent().stream()
                .map(appMapper::applicationToApplicationResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getAllApplications(Candidate candidate, PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAllByCandidate(candidate, pageRequest);
        List<ApplicationResponse> responses = applications.getContent().stream()
                .map(appMapper::applicationToApplicationResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApplicationDetailResponse createApplication(ApplicationRequest request) {
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Candidate candidate)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }
        return createApplication(request, candidate);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApplicationDetailResponse createApplication(ApplicationRequest request, Candidate candidate) {
        Job existingJob = jobRepository.findById(request.getJobId()).orElseThrow(
                () -> new NotFoundException(messageService.getMessage("error.not.found.job", request.getJobId())));
        
        // Check if the job is open and the application deadline has not passed
        if (existingJob.getStatus() != JobStatus.OPEN) {
            throw new AccessDeniedException(messageService.getMessage("error.job.not.open"));
        }
        LocalDate now = LocalDate.now();
        if (existingJob.getApplicationDeadline() != null && existingJob.getApplicationDeadline().isBefore(now)) {
            throw new AccessDeniedException(messageService.getMessage("error.job.application.deadline.passed"));
        }

        // Check for duplicate application
        if (hasAppliedForJob(candidate, existingJob)) {
            throw new DuplicateException(messageService.getMessage("error.duplicate.application"));
        }

        // Check if the job's number of openings is not exceeded
        if (existingJob.getNumberOfOpenings() <= existingJob.getApplications().size()) {
            throw new AccessDeniedException(messageService.getMessage("error.job.application.openings.exceeded"));
        }

        CV existingCv = cvRepository.findByIdAndCandidate(request.getCvId(), candidate)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.cv")));

        Application newApplication = Application.builder()
                .job(existingJob)
                .cv(existingCv)
                .candidate(candidate)
                .build();
        Application savedApplication = applicationRepository.save(newApplication);

        return appMapper.applicationToApplicationDetailResponse(savedApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplication(Long id) {
        Application existingApplication = applicationRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.application", id)));
        return appMapper.applicationToApplicationDetailResponse(existingApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplication(Long id, Candidate candidate) {
        if (candidate == null) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }

        Application existingApplication = applicationRepository
                .findByIdAndCandidate(id, candidate)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.application", id)));
        return appMapper.applicationToApplicationDetailResponse(existingApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplication(Long id, Recruiter recruiter) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.application", id)));

        // Check if the recruiter can access this application
        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId()) &&
                !application.getJob().getCompany().getId().equals(recruiter.getCompany().getId())) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.application.access"));
        }

        return appMapper.applicationToApplicationDetailResponse(application);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void withdrawApplication(Long id, Candidate candidate) {
        if (candidate == null) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }

        if (!canWithdrawApplication(id, candidate)) {
            throw new AccessDeniedException(messageService.getMessage("error.application.cannot.withdraw"));
        }

        Application existingApplication = applicationRepository
                .findByIdAndCandidate(id, candidate)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.application", id)));

        existingApplication.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(existingApplication);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApplicationDetailResponse updateApplicationStatus(Long id, ApplicationStatus status, Recruiter recruiter) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.application", id)));
        
        if (!canUpdateApplicationStatus(id, status, recruiter)) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.application.status.update"));
        }
        
        application.setStatus(status);
        Application savedApplication = applicationRepository.save(application);
        
        return appMapper.applicationToApplicationDetailResponse(savedApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByStatus(Job job, ApplicationStatus status, PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAllByJobAndStatus(job, status, pageRequest);
        List<ApplicationResponse> responses = applications.getContent().stream()
                .map(appMapper::applicationToApplicationResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAppliedForJob(Candidate candidate, Job job) {
        return applicationRepository.existsByCandidateAndJob(candidate, job);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canWithdrawApplication(Long applicationId, Candidate candidate) {
        Application application = applicationRepository.findByIdAndCandidate(applicationId, candidate)
                .orElse(null);
        
        if (application == null) {
            return false;
        }
        
        // Can only withdraw if the status is APPLIED or IN_REVIEW
        return application.getStatus() == ApplicationStatus.APPLIED || 
               application.getStatus() == ApplicationStatus.IN_REVIEW;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canUpdateApplicationStatus(Long applicationId, ApplicationStatus newStatus, Recruiter recruiter) {
        Application application = applicationRepository.findById(applicationId).orElse(null);
        
        if (application == null) {
            return false;
        }
        
        // Check if the recruiter can access this application
        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId()) && 
            !application.getJob().getCompany().getId().equals(recruiter.getCompany().getId())) {
            return false;
        }
        
        ApplicationStatus currentStatus = application.getStatus();
        
        // Cannot update withdrawn applications
        if (currentStatus == ApplicationStatus.WITHDRAWN) {
            return false;
        }
        
        // Define valid status transitions
        return switch (currentStatus) {
            case APPLIED -> newStatus == ApplicationStatus.IN_REVIEW || newStatus == ApplicationStatus.REJECTED;
            case IN_REVIEW -> newStatus == ApplicationStatus.INTERVIEW || newStatus == ApplicationStatus.REJECTED;
            case INTERVIEW -> newStatus == ApplicationStatus.OFFERED || newStatus == ApplicationStatus.REJECTED;
            case OFFERED, REJECTED -> false; // Final states
            default -> false;
        };
    }
}
