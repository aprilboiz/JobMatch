package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;



public interface CandidateRepository extends JpaRepository<Candidate, Long> {
}
