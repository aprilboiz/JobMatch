package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.enumerate.JobStatus;
import com.aprilboiz.jobmatch.enumerate.JobType;
import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.Job;
import com.aprilboiz.jobmatch.model.Recruiter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, Long> {
    Optional<Job> findByTitleIgnoreCase(String title);
    Page<Job> findAllByJobType(JobType jobType, Pageable pageable);
    Page<Job> findAllByLocation(String location, Pageable pageable);
    Page<Job> findAllByCompany(Company company, Pageable pageable);
    Page<Job> findAllByRecruiter(Recruiter recruiter, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.company.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType) AND " +
           "(:location IS NULL OR :location = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minSalary IS NULL OR j.minSalary >= :minSalary) AND " +
           "(:maxSalary IS NULL OR j.maxSalary <= :maxSalary) AND " +
           "(:companyName IS NULL OR :companyName = '' OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :companyName, '%'))) AND " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:applicationDeadlineAfter IS NULL OR j.applicationDeadline >= :applicationDeadlineAfter)")
    Page<Job> searchAndFilterJobs(
            @Param("keyword") String keyword,
            @Param("jobType") JobType jobType,
            @Param("location") String location,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            @Param("companyName") String companyName,
            @Param("status") JobStatus status,
            @Param("applicationDeadlineAfter") LocalDate applicationDeadlineAfter,
            Pageable pageable);
    
    @Query("SELECT DISTINCT j.location FROM Job j WHERE j.location IS NOT NULL AND j.location != '' ORDER BY j.location")
    List<String> findDistinctLocations();
    
    @Query("SELECT DISTINCT j.company.name FROM Job j WHERE j.company.name IS NOT NULL ORDER BY j.company.name")
    List<String> findDistinctCompanyNames();
}
