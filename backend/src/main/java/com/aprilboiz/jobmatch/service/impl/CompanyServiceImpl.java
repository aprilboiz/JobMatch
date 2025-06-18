package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.request.CompanyRequest;
import com.aprilboiz.jobmatch.dto.response.CompanyResponse;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.repository.CompanyRepository;
import com.aprilboiz.jobmatch.service.CompanyService;
import com.aprilboiz.jobmatch.service.MessageService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyServiceImpl implements CompanyService {
    private final CompanyRepository companyRepository;
    private final MessageService messageService;
    private final ApplicationMapper appMapper;

    public CompanyServiceImpl(CompanyRepository companyRepository, MessageService messageService, ApplicationMapper appMapper) {
        this.companyRepository = companyRepository;
        this.messageService = messageService;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Recruiter recruiter = userPrincipal.getUser().getRecruiter();
        if (recruiter == null) {
            throw new NotFoundException(messageService.getMessage("error.authorization.recruiter.required"));
        }
        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.company")));
        if (!recruiter.getCompany().getId().equals(existingCompany.getId())) {
            throw new AccessDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
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
