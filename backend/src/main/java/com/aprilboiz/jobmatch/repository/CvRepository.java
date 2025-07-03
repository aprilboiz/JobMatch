package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Candidate;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CvRepository extends SoftDeleteRepository<CV, Long> {
    List<CV> findByCandidate(Candidate candidate);
    Optional<CV> findByFileNameAndCandidate(String fileName, Candidate candidate);
    Optional<CV> findByIdAndCandidate(Long id, Candidate candidate);
    
    /**
     * Find CVs by candidate including soft-deleted ones
     */
    @Query("SELECT cv FROM CV cv WHERE cv.candidate = :candidate")
    List<CV> findByCandidateIncludeDeleted(@Param("candidate") Candidate candidate);
    
    /**
     * Find CV by ID and candidate including soft-deleted ones
     */
    @Query("SELECT cv FROM CV cv WHERE cv.id = :id AND cv.candidate = :candidate")
    Optional<CV> findByIdAndCandidateIncludeDeleted(@Param("id") Long id, @Param("candidate") Candidate candidate);
}
