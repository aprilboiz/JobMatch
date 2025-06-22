package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.request.CompanyRequest;
import com.aprilboiz.jobmatch.dto.response.CompanyResponse;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.*;
import com.aprilboiz.jobmatch.repository.CompanyRepository;
import com.aprilboiz.jobmatch.service.CloudinaryService;
import com.aprilboiz.jobmatch.service.CompanyService;
import com.aprilboiz.jobmatch.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyServiceImpl implements CompanyService {
    private final CompanyRepository companyRepository;
    private final MessageService messageService;
    private final ApplicationMapper appMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Recruiter recruiter)) {
            throw new SecurityException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.company")));
        if (!recruiter.getCompany().getId().equals(existingCompany.getId())) {
            throw new SecurityException(messageService.getMessage("error.authorization.recruiter.required"));
        }
        existingCompany.setName(request.getName());
        existingCompany.setWebsite(request.getWebsite());
        existingCompany.setPhoneNumber(request.getPhoneNumber());
        existingCompany.setEmail(request.getEmail());
        existingCompany.setAddress(request.getAddress());
        existingCompany.setCompanySize(request.getCompanySize());
        existingCompany.setIndustry(request.getIndustry());
        existingCompany.setDescription(request.getDescription());
        return appMapper.companyToCompanyResponse(companyRepository.save(existingCompany));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCompanyLogo(Long companyId, String logoUrl) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.company")));

        // Delete old logo if exists
        if (company.getLogoUrl() != null && !company.getLogoUrl().isEmpty()) {
            try {
                String oldPublicId = cloudinaryService.extractPublicIdFromUrl(company.getLogoUrl());
                if (oldPublicId != null) {
                    cloudinaryService.delete(oldPublicId);
                }
            } catch (Exception e) {
                // Log warning but don't fail the operation
                log.warn("Failed to delete old logo for company {}: {}", companyId, e.getMessage());
            }
        }

        company.setLogoUrl(logoUrl);
        companyRepository.save(company);
    }
}
