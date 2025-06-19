package com.aprilboiz.jobmatch.service;

import com.aprilboiz.jobmatch.dto.request.ApplicationRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.enumerate.ApplicationStatus;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Job;
import com.aprilboiz.jobmatch.model.Recruiter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface ApplicationService {
    Page<ApplicationResponse> getAllApplications(PageRequest pageRequest);
    Page<ApplicationResponse> getAllApplications(Job job, PageRequest pageRequest);
    Page<ApplicationResponse> getAllApplications(Candidate candidate, PageRequest pageRequest);

    Page<ApplicationResponse> getApplicationsByStatus(Job job, ApplicationStatus status, PageRequest pageRequest);

    ApplicationDetailResponse createApplication(ApplicationRequest request);
    ApplicationDetailResponse createApplication(ApplicationRequest request, Candidate candidate);

    ApplicationDetailResponse getApplication(Long id);
    ApplicationDetailResponse getApplication(Long id, Candidate candidate);
    ApplicationDetailResponse getApplication(Long id, Recruiter recruiter);

    ApplicationDetailResponse updateApplicationStatus(Long id, ApplicationStatus status, Recruiter recruiter);

    void withdrawApplication(Long id, Candidate candidate);

    boolean hasAppliedForJob(Candidate candidate, Job job);
    boolean canWithdrawApplication(Long applicationId, Candidate candidate);
    boolean canUpdateApplicationStatus(Long applicationId, ApplicationStatus newStatus, Recruiter recruiter);
}
