package com.aprilboiz.jobmatch.service.impl;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aprilboiz.jobmatch.dto.response.ApplicationResponse;
import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.repository.CvRepository;
import com.aprilboiz.jobmatch.service.CandidateService;
import com.aprilboiz.jobmatch.storage.StorageService;

@Service
public class CandidateServiceImpl implements CandidateService {
    private final StorageService storageService;
    private final CvRepository cvRepository;
    private final ApplicationMapper appMapper;

    public CandidateServiceImpl(StorageService storageService, CvRepository cvRepository, ApplicationMapper appMapper) {
        this.storageService = storageService;
        this.cvRepository = cvRepository;
        this.appMapper = appMapper;
    }

    @Override
    public List<CvResponse> getAllCandidateCv() {
        UserPrincipal userDetails = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Candidate candidate = userDetails.getUser().getCandidate();
        List<CV> cvs = cvRepository.findByCandidate(candidate);
        return cvs.stream().map(appMapper::cvToCvResponse).collect(Collectors.toList());
    }

    @Override
    public CvResponse getCandidateCv(Long id) {
        CV cv = cvRepository.findById(id).orElseThrow(() -> new NotFoundException("CV not found"));
        return appMapper.cvToCvResponse(cv);
    }

    @Override
    public void deleteCandidateCv(Long id) {
        CV cv = cvRepository.findById(id).orElseThrow(() -> new NotFoundException("CV not found"));
        cvRepository.delete(cv);
    }

    @Override
    public Resource downloadCandidateCv(Long id) {
        CV cv = cvRepository.findById(id).orElseThrow(() -> new NotFoundException("CV not found"));
        return storageService.loadAsResource(cv.getFilePath());
    }

    @Override
    public List<ApplicationResponse> getAllCandidateApplications() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAllCandidateApplications'");
    }

    @Override
    public CvResponse createCandidateCv(MultipartFile file) {
        String filePath = storageService.store(file);
        
        CV cv = new CV();
        cv.setFilePath(filePath);
        cv.setFileType(file.getContentType());
        cv.setFileName(file.getOriginalFilename());
        cv.setFileSize(String.valueOf(file.getSize()));

        UserPrincipal userDetails = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Candidate candidate = userDetails.getUser().getCandidate();
        cv.setCandidate(candidate);

        CV savedCv = cvRepository.save(cv);
        return appMapper.cvToCvResponse(savedCv);
    }
}
