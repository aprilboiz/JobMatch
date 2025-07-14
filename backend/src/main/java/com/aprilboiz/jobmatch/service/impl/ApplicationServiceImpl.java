package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.AnalysisDTO;
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
import com.aprilboiz.jobmatch.repository.AnalysisRepository;
import com.aprilboiz.jobmatch.repository.JobRepository;
import com.aprilboiz.jobmatch.service.ApplicationService;
import com.aprilboiz.jobmatch.service.AnalysisService;
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

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {
    private static final Logger logger = LoggerFactory.getLogger(ApplicationServiceImpl.class);
    private final ApplicationRepository applicationRepository;
    private final AnalysisRepository analysisRepository;
    private final JobRepository jobRepository;
    private final CvRepository cvRepository;
    private final ApplicationMapper appMapper;
    private final MessageService messageService;
    private final AnalysisService analysisService;


    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDetailResponse> getAllApplications(PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAll(pageRequest);
        List<ApplicationDetailResponse> responses = applications.getContent().stream()
                .map(appMapper::applicationToApplicationDetailResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDetailResponse> getAllApplications(Job job, PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAllByJob(job, pageRequest);
        List<ApplicationDetailResponse> responses = applications.getContent().stream()
                .map(appMapper::applicationToApplicationDetailResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDetailResponse> getAllApplications(Candidate candidate, PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAllByCandidate(candidate, pageRequest);
        List<ApplicationDetailResponse> responses = applications.getContent().stream()
                .map(appMapper::applicationToApplicationDetailResponse).toList();
        return new PageImpl<>(responses, pageRequest, applications.getTotalElements());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApplicationResponse createApplication(ApplicationRequest request) {
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
    public ApplicationResponse createApplication(ApplicationRequest request, Candidate candidate) {
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

        AnalysisDTO analysisResponse = analysisService.analyzeJobMatch(existingJob, existingCv);
        Analysis analysis = Analysis.builder()
                .score(analysisResponse.getSimilarityScore())
                .matchSkills(extractMatchingSkills(analysisResponse, existingJob))
                .missingSkills(extractMissingSkills(analysisResponse, existingJob))
                .build();
        analysis = analysisRepository.save(analysis);
        

        Application newApplication = Application.builder()
                .job(existingJob)
                .cv(existingCv)
                .candidate(candidate)
                .analysis(analysis)
                .build();
        Application savedApplication = applicationRepository.save(newApplication);

        return appMapper.applicationToApplicationResponse(savedApplication);
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
    public Page<ApplicationDetailResponse> getApplicationsByStatus(Job job, ApplicationStatus status, PageRequest pageRequest) {
        Page<Application> applications = applicationRepository.findAllByJobAndStatus(job, status, pageRequest);
        List<ApplicationDetailResponse> responses = applications.getContent().stream()
                .map(appMapper::applicationToApplicationDetailResponse).toList();
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
        return applicationRepository.findByIdAndCandidate(applicationId, candidate)
                .map(application -> {
                    // Can only withdraw if application is in APPLIED or IN_REVIEW status
                    return application.getStatus() == ApplicationStatus.APPLIED ||
                           application.getStatus() == ApplicationStatus.IN_REVIEW;
                })
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canUpdateApplicationStatus(Long applicationId, ApplicationStatus newStatus, Recruiter recruiter) {
        return applicationRepository.findById(applicationId)
                .map(application -> {
                    // Only job owner can update status
                    if (!application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
                        return false;
                    }
                    
                    // Check valid status transitions
                    ApplicationStatus currentStatus = application.getStatus();
                    return isValidStatusTransition(currentStatus, newStatus);
                })
                .orElse(false);
    }
    
    /**
     * Helper method to extract matching skills from AI analysis response
     * Uses the skills analysis from AI service when available, otherwise falls back to job-based analysis
     */
    private String extractMatchingSkills(AnalysisDTO analysisResponse, Job job) {
        try {
            // Use AI service skills analysis if available
            if (analysisResponse.getMatchSkills() != null && !analysisResponse.getMatchSkills().trim().isEmpty()) {
                return analysisResponse.getMatchSkills();
            }
            
            // Fallback logic for backward compatibility
            if (analysisResponse.getSimilarityScore() != null && analysisResponse.getSimilarityScore() > 70) {
                return job.getSkills() != null ? String.join(", ", job.getSkills()) : "General skills match detected";
            } else if (analysisResponse.getSimilarityScore() != null && analysisResponse.getSimilarityScore() > 50) {
                return job.getSkills() != null && !job.getSkills().isEmpty() 
                    ? "Partial match: " + String.join(", ", job.getSkills().subList(0, Math.min(job.getSkills().size() / 2, job.getSkills().size())))
                    : "Some relevant skills detected";
            }
            return "Limited skill matches found";
        } catch (Exception e) {
            logger.warn("Failed to extract matching skills: {}", e.getMessage());
            return "Skills analysis unavailable";
        }
    }
    
    /**
     * Helper method to extract missing skills from AI analysis response  
     * Uses the skills analysis from AI service when available, otherwise falls back to job-based analysis
     */
    private String extractMissingSkills(AnalysisDTO analysisResponse, Job job) {
        try {
            // Use AI service skills analysis if available
            if (analysisResponse.getMissingSkills() != null && !analysisResponse.getMissingSkills().trim().isEmpty()) {
                return analysisResponse.getMissingSkills();
            }
            
            // Fallback logic for backward compatibility
            if (analysisResponse.getSimilarityScore() != null && analysisResponse.getSimilarityScore() < 50) {
                return job.getSkills() != null && !job.getSkills().isEmpty()
                    ? "Consider developing: " + String.join(", ", job.getSkills())
                    : "Review job requirements for skill gaps";
            } else if (analysisResponse.getSimilarityScore() != null && analysisResponse.getSimilarityScore() < 70) {
                return job.getSkills() != null && !job.getSkills().isEmpty()
                    ? "Potential improvements in: " + String.join(", ", job.getSkills().subList(Math.min(job.getSkills().size() / 2, job.getSkills().size()), job.getSkills().size()))
                    : "Some skill enhancement opportunities";
            }
            return "No significant skill gaps identified";
        } catch (Exception e) {
            logger.warn("Failed to extract missing skills: {}", e.getMessage());
            return "Skills gap analysis unavailable";
        }
    }

    /**
     * Validates if a status transition is allowed
     */
    private boolean isValidStatusTransition(ApplicationStatus currentStatus, ApplicationStatus newStatus) {
        return switch (currentStatus) {
            case APPLIED -> newStatus == ApplicationStatus.IN_REVIEW || newStatus == ApplicationStatus.REJECTED;
            case IN_REVIEW -> newStatus == ApplicationStatus.INTERVIEW || newStatus == ApplicationStatus.REJECTED;
            case INTERVIEW -> newStatus == ApplicationStatus.OFFERED || newStatus == ApplicationStatus.REJECTED;
            case OFFERED, REJECTED -> false; // Final states
            default -> false; // Any unknown status
        };
    }
}
