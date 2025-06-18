package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.Application;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findAllByCandidate(Candidate candidate, Pageable pageable);
    Page<Application> findAllByJob(Job job, Pageable pageable);
    Optional<Application> findByIdAndCandidate(Long id, Candidate candidate);
}
