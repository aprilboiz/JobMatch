package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.request.CompanyRequest;
import com.aprilboiz.jobmatch.dto.response.CompanyResponse;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.*;
import com.aprilboiz.jobmatch.repository.CompanyRepository;
import com.aprilboiz.jobmatch.service.CompanyService;
import com.aprilboiz.jobmatch.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    private final CompanyRepository companyRepository;
    private final MessageService messageService;
    private final ApplicationMapper appMapper;

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
}
