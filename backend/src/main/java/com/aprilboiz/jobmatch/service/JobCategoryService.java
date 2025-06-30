package com.aprilboiz.jobmatch.service;

import com.aprilboiz.jobmatch.model.JobCategory;

import java.util.List;
import java.util.Optional;

public interface JobCategoryService {
    List<JobCategory> getAllActiveCategories();
    List<JobCategory> getAllCategories();
    Optional<JobCategory> getCategoryById(Integer id);
    Optional<JobCategory> getCategoryByName(String name);
    JobCategory createCategory(String name, String description);
    JobCategory updateCategory(Integer id, String name, String description);
    void deactivateCategory(Integer id);
    void activateCategory(Integer id);
    boolean existsById(Integer id);
} 