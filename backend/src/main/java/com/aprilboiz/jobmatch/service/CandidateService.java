package com.aprilboiz.jobmatch.service;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.dto.response.CvResponse;

public interface CandidateService {
    CvResponse createCandidateCv(MultipartFile file);
    List<CvResponse> getAllCandidateCv();
    CvResponse getCandidateCv(Long id);
    void deleteCandidateCv(Long id);
    Resource downloadCandidateCv(Long id);
    List<ApplicationResponse> getAllCandidateApplications();
}
