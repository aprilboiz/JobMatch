package com.aprilboiz.jobmatch.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.aprilboiz.jobmatch.dto.request.JobRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.dto.response.JobResponse;
import com.aprilboiz.jobmatch.enumerate.JobStatus;
import com.aprilboiz.jobmatch.enumerate.JobType;
import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.Recruiter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface JobService {
    JobResponse createJob(JobRequest jobRequest);
    JobResponse getJob(Long id);
    JobResponse updateJob(Long id, JobRequest jobRequest);
    void deleteJob(Long id);
    Page<JobResponse> getAllJobs(PageRequest pageRequest);
    Page<JobResponse> getJobsByRecruiter(Recruiter recruiter, PageRequest pageRequest);
    Page<JobResponse> getJobsByCompany(Company company, PageRequest pageRequest);
    Page<ApplicationResponse> getJobApplications(Long jobId, PageRequest pageRequest);
    
    // Search and filter method
    Page<JobResponse> searchAndFilterJobs(
            String keyword,
            JobType jobType,
            Integer jobCategory,
            String location,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            String companyName,
            JobStatus status,
            LocalDate applicationDeadlineAfter,
            PageRequest pageRequest);
    
    // Methods to get filter options
    List<String> getDistinctLocations();
    List<String> getDistinctCompanyNames();
}
