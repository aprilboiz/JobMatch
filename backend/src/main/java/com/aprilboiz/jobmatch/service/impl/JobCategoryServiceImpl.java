package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.model.JobCategory;
import com.aprilboiz.jobmatch.repository.JobCategoryRepository;
import com.aprilboiz.jobmatch.service.JobCategoryService;
import com.aprilboiz.jobmatch.service.MessageService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobCategoryServiceImpl implements JobCategoryService {
    private final JobCategoryRepository jobCategoryRepository;
    private final MessageService messageService;

    @Override
    @Transactional(readOnly = true)
    public List<JobCategory> getAllActiveCategories() {
        return jobCategoryRepository.findAllActive();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobCategory> getAllCategories() {
        return jobCategoryRepository.findAllOrderById();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<JobCategory> getCategoryById(Integer id) {
        return jobCategoryRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<JobCategory> getCategoryByName(String name) {
        return jobCategoryRepository.findByName(name);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public JobCategory createCategory(String name, String description) {
        JobCategory category = JobCategory.builder()
                .name(name)
                .description(description)
                .isActive(true)
                .build();
        return jobCategoryRepository.save(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public JobCategory updateCategory(Integer id, String name, String description) {
        JobCategory category = jobCategoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.job.category", id)));
        
        category.setName(name);
        category.setDescription(description);
        return jobCategoryRepository.save(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deactivateCategory(Integer id) {
        JobCategory category = jobCategoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Job category not found with ID: " + id));
        
        category.setIsActive(false);
        jobCategoryRepository.save(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void activateCategory(Integer id) {
        JobCategory category = jobCategoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.job.category", id)));
        
        category.setIsActive(true);
        jobCategoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(Integer id) {
        return jobCategoryRepository.existsById(id);
    }
} 