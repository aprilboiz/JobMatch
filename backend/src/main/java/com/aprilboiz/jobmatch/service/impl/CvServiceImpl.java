package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.exception.DuplicateException;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.*;
import com.aprilboiz.jobmatch.repository.ApplicationRepository;
import com.aprilboiz.jobmatch.repository.CvRepository;
import com.aprilboiz.jobmatch.service.CvService;
import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.storage.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CvServiceImpl implements CvService {
    private final CvRepository cvRepository;
    private final ApplicationMapper appMapper;
    private final StorageService storageService;
    private final MessageService messageService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CvResponse createCv(MultipartFile file, Candidate candidate) {
        Optional<CV> existingCv = cvRepository.findByFileNameAndCandidate(file.getOriginalFilename(), candidate);
        if (existingCv.isPresent()) {
            throw new DuplicateException(messageService.getMessage("error.duplicate.cv"));
        }

        String filePath = storageService.store(file);

        CV cv = new CV();
        cv.setFilePath(filePath);
        cv.setFileType(file.getContentType());
        cv.setFileName(file.getOriginalFilename());
        cv.setFileSize(String.valueOf(file.getSize()));
        cv.setCandidate(candidate);

        return appMapper.cvToCvResponse(cvRepository.save(cv));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CvResponse> getAllCv(Candidate candidate) {
        List<CV> cvs = cvRepository.findByCandidate(candidate);
        return cvs.stream().map(appMapper::cvToCvResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CvResponse getCv(Long id) {
        CV cv = cvRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.not.found.cv")));
        return appMapper.cvToCvResponse(cv);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCv(Long cvId) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.cv")));

        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userPrincipalAdapter.getUser();
        if (!(user instanceof Candidate candidate)) {
            throw new SecurityException(messageService.getMessage("error.authorization.candidate.required"));
        }

        if (!cv.getCandidate().getId().equals(candidate.getId())) {
            throw new SecurityException(messageService.getMessage("error.authorization.cv.access"));
        }

        cvRepository.deleteById(cvId);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadCv(Long id) {
        UserPrincipalAdapter userPrincipalAdapter = (UserPrincipalAdapter) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CV cv = cvRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.not.found.cv")));

        User user = userPrincipalAdapter.getUser();

        if (user instanceof Candidate candidate) {
            if (cv.getCandidate().getId().equals(candidate.getId())) {
                return storageService.loadAsResource(cv.getFilePath());
            }
        } else if (user instanceof Recruiter recruiter) {
            // Check if the recruiter can access this CV (through job applications)
            boolean hasAccess = cv.getApplications().stream()
                    .anyMatch(application ->
                            application.getJob().getRecruiter().getId().equals(recruiter.getId()) ||
                                    application.getJob().getCompany().getId().equals(recruiter.getCompany().getId())
                    );
            if (hasAccess) {
                return storageService.loadAsResource(cv.getFilePath());
            }
        }

        throw new AccessDeniedException(messageService.getMessage("error.permission.cv.download"));
    }
}
