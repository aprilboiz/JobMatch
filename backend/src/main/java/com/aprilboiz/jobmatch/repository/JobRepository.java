package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.Job;
import com.aprilboiz.jobmatch.model.Recruiter;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
    Optional<Job> findByTitle(String title);
    List<Job> findAllByJobType(String jobType);
    List<Job> findAllByLocation(String location);
    List<Job> findAllByCompany(Company company);
    List<Job> findAllByRecruiter(Recruiter recruiter);
}
