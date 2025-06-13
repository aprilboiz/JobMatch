package com.aprilboiz.jobmatch.service;

import java.util.List;

import com.aprilboiz.jobmatch.dto.request.JobRequest;
import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.dto.response.JobResponse;

public interface JobService {
    JobResponse createJob(JobRequest jobRequest);
    JobResponse getJob(Long id);
    JobResponse updateJob(Long id, JobRequest jobRequest);
    void deleteJob(Long id);
    List<JobResponse> getAllJobs();
    List<ApplicationResponse> getJobApplications(Long id);
}
