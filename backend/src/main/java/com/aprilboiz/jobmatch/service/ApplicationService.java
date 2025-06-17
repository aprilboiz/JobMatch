package com.aprilboiz.jobmatch.service;

import com.aprilboiz.jobmatch.dto.request.ApplicationRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationDetailResponse;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface ApplicationService {
    Page<ApplicationResponse> getAllApplications(PageRequest pageRequest);
    Page<ApplicationResponse> getAllApplications(Job job, PageRequest pageRequest);
    Page<ApplicationResponse> getAllApplications(Candidate candidate, PageRequest pageRequest);
    ApplicationResponse createApplication(ApplicationRequest request);
    ApplicationDetailResponse getApplication(Long id);
    ApplicationDetailResponse getApplication(Long id, Candidate candidate);
    void withdrawApplication(Long id, Candidate candidate);
}
