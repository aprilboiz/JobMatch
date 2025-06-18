package com.aprilboiz.jobmatch.service;

import com.aprilboiz.jobmatch.dto.request.CompanyRequest;
import com.aprilboiz.jobmatch.dto.response.CompanyResponse;

public interface CompanyService {
    CompanyResponse updateCompany(Long id, CompanyRequest request);
}
