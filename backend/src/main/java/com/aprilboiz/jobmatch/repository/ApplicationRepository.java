package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.enumerate.ApplicationStatus;
import com.aprilboiz.jobmatch.model.Application;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;


public interface ApplicationRepository extends SoftDeleteRepository<Application, Long> {
    Page<Application> findAllByCandidate(Candidate candidate, Pageable pageable);
    Page<Application> findAllByJob(Job job, Pageable pageable);
    Page<Application> findAllByJobAndStatus(Job job, ApplicationStatus status, Pageable pageable);
    Optional<Application> findByIdAndCandidate(Long id, Candidate candidate);
    Optional<Application> findByCandidateAndJob(Candidate candidate, Job job);
    boolean existsByCandidateAndJob(Candidate candidate, Job job);
    long countByJobAndStatus(Job job, ApplicationStatus status);
}
