package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Integer> {
    
    Optional<JobCategory> findByName(String name);
    
    @Query("SELECT jc FROM JobCategory jc WHERE jc.isActive = true ORDER BY jc.name")
    List<JobCategory> findAllActive();
    
    @Query("SELECT jc FROM JobCategory jc ORDER BY jc.id")
    List<JobCategory> findAllOrderById();
} 