package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.request.ApplicationRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
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

import java.util.List;

@Service
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CvRepository cvRepository;
    private final ApplicationMapper appMapper;
    private final MessageService messageService;

    public ApplicationServiceImpl(ApplicationRepository applicationRepository, JobRepository jobRepository, CvRepository cvRepository, ApplicationMapper appMapper, MessageService messageService) {
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
        List<ApplicationResponse> responses = applications.getContent().stream().map(appMapper::applicationToApplicationResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getAllApplications(Job job, PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAllByJob(job, pageRequest);
        List<ApplicationResponse> responses = applications.getContent().stream().map(appMapper::applicationToApplicationResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getAllApplications(Candidate candidate, PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAllByCandidate(candidate, pageRequest);
        List<ApplicationResponse> responses = applications.getContent().stream().map(appMapper::applicationToApplicationResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApplicationResponse createApplication(ApplicationRequest request) {
        Job existingJob = jobRepository.findById(request.getJobId()).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.job.not.found", request.getJobId())));
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Candidate candidate = userPrincipal.getUser().getCandidate();

        CV existingCv = cvRepository.findByIdAndCandidate(request.getCvId(), candidate).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.cv.not.found")));

        Application newApplication = Application.builder().job(existingJob).cv(existingCv).candidate(candidate).build();

        return appMapper.applicationToApplicationResponse(applicationRepository.save(newApplication));
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplication(Long id) {
        Application existingApplication = applicationRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.application.not.found", id)));
        return appMapper.applicationToApplicationDetailResponse(existingApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplication(Long id, Candidate candidate) {
        if (candidate == null) {
            throw new AccessDeniedException(messageService.getMessage("error.user.authorization.candidate"));
        }

        Application existingApplication = applicationRepository
                .findByIdAndCandidate(id, candidate)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.application.not.found", id)));
        return appMapper.applicationToApplicationDetailResponse(existingApplication);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void withdrawApplication(Long id, Candidate candidate) {
        if (candidate == null) {
            throw new AccessDeniedException(messageService.getMessage("error.user.authorization.candidate"));
        }

        Application existingApplication = applicationRepository
                .findByIdAndCandidate(id, candidate)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.application.not.found", id)));
        
        applicationRepository.delete(existingApplication);
    }
}
