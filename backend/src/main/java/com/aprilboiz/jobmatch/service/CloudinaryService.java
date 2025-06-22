package com.aprilboiz.jobmatch.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.CompletableFuture;

public interface CloudinaryService {
    String upload(MultipartFile file, String folder);
    void delete(String publicId);
    String extractPublicIdFromUrl(String cloudinaryUrl);
    
    // Async methods
    CompletableFuture<String> uploadAsync(MultipartFile file, String folder);
    CompletableFuture<Void> deleteAsync(String publicId);
} 