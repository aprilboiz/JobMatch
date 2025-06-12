package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Candidate;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CvRepository extends JpaRepository<CV, Long> {
    List<CV> findByCandidate(Candidate candidate);
    Optional<CV> findByFileNameAndCandidate(String fileName, Candidate candidate);
}
