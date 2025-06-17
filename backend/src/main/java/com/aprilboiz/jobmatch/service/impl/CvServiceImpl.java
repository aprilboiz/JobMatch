package com.aprilboiz.jobmatch.service.impl;

import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.exception.DuplicateException;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.repository.CvRepository;
import com.aprilboiz.jobmatch.service.CvService;
import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.storage.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CvServiceImpl implements CvService {
    private final CvRepository cvRepository;
    private final ApplicationMapper appMapper;
    private final StorageService storageService;
    private final MessageService messageService;

    public CvServiceImpl(CvRepository cvRepository, ApplicationMapper appMapper, 
                        StorageService storageService, MessageService messageService) {
        this.cvRepository = cvRepository;
        this.appMapper = appMapper;
        this.storageService = storageService;
        this.messageService = messageService;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CvResponse createCv(MultipartFile file, Candidate candidate) {
        Optional<CV> existingCv = cvRepository.findByFileNameAndCandidate(file.getOriginalFilename(), candidate);
        if (existingCv.isPresent()) {
            throw new DuplicateException(messageService.getMessage("error.cv.duplicate"));
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
            new NotFoundException(messageService.getMessage("error.cv.not.found")));
        return appMapper.cvToCvResponse(cv);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCv(Long id) {
        CV cv = cvRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.cv.not.found")));
        cvRepository.delete(cv);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadCv(Long id) {
        CV cv = cvRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.cv.not.found")));
        return storageService.loadAsResource(cv.getFilePath());
    }
}
