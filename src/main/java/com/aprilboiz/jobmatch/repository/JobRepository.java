package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;



public interface JobRepository extends JpaRepository<Job, Long> {
}
