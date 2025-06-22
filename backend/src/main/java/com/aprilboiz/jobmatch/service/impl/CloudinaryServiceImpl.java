package com.aprilboiz.jobmatch.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.aprilboiz.jobmatch.exception.StorageException;
import com.aprilboiz.jobmatch.service.CloudinaryService;
import com.aprilboiz.jobmatch.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {
    
    private final Cloudinary cloudinary;
    private final MessageService messageService;

    @Override
    public String upload(MultipartFile file, String folder) {
        try {
            String uniqueFilename = UUID.randomUUID().toString();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", uniqueFilename,
                    "resource_type", "image",
                    "transformation", "q_auto,f_auto"
                )
            );
            
            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Successfully uploaded image to Cloudinary: {}", imageUrl);
            return imageUrl;
            
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new StorageException(messageService.getMessage("storage.failed", "upload image to Cloudinary"), e);
        }
    }

    @Override
    @Async("imageUploadExecutor")
    public CompletableFuture<String> uploadAsync(MultipartFile file, String folder) {
        try {
            log.info("Starting async upload for file: {} to folder: {}", file.getOriginalFilename(), folder);
            String result = upload(file, folder);
            log.info("Completed async upload for file: {}", file.getOriginalFilename());
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            log.error("Async upload failed for file: {}", file.getOriginalFilename(), e);
            return CompletableFuture.failedFuture(e);
        }
    }

    @Override
    public void delete(String publicId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String result = (String) deleteResult.get("result");
            
            if (!"ok".equals(result)) {
                log.warn("Cloudinary deletion returned non-ok result: {} for publicId: {}", result, publicId);
            } else {
                log.info("Successfully deleted image from Cloudinary: {}", publicId);
            }
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", publicId, e);
            throw new StorageException(messageService.getMessage("storage.failed", "delete image from Cloudinary"), e);
        }
    }

    @Override
    @Async("imageUploadExecutor")
    public CompletableFuture<Void> deleteAsync(String publicId) {
        try {
            log.info("Starting async delete for publicId: {}", publicId);
            delete(publicId);
            log.info("Completed async delete for publicId: {}", publicId);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Async delete failed for publicId: {}", publicId, e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    public String extractPublicIdFromUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            return null;
        }
        
        try {
            // Extract public ID from the URL pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
            String[] parts = cloudinaryUrl.split("/");
            if (parts.length >= 7) {
                // Get the part after 'upload' and remove the file extension
                String publicIdWithExtension = parts[parts.length - 1];
                String folder = parts[parts.length - 2];
                
                // Remove file extension
                String publicIdOnly = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
                
                // Return folder/publicId format
                return folder + "/" + publicIdOnly;
            }
        } catch (Exception e) {
            log.warn("Failed to extract public ID from URL: {}", cloudinaryUrl, e);
        }
        
        return null;
    }
} 