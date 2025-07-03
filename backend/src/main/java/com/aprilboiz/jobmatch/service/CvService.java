package com.aprilboiz.jobmatch.service;

import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.model.Candidate;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CvService {
    CvResponse createCv(MultipartFile file, Candidate candidate);
    List<CvResponse> getAllCv(Candidate candidate);
    CvResponse getCv(Long id);
    void deleteCv(Long id);
    void restoreCv(Long id);
    List<CvResponse> getDeletedCv(Candidate candidate);
    Resource downloadCv(Long id);
}
