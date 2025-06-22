package com.aprilboiz.jobmatch.dto.request;

import com.aprilboiz.jobmatch.annotation.ValidContentType;
import com.aprilboiz.jobmatch.annotation.ValidFileExtension;
import com.aprilboiz.jobmatch.annotation.ValidFileSize;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;

public class ImageUploadRequest {
    
    @Schema(description = "Image file to upload (PNG, JPG, JPEG)", 
            type = "string", format = "binary")
    @ValidFileSize(maxSize = 5242880L, message = "File size must not exceed 5MB") // 5MB
    @ValidFileExtension(extensions = {"png", "jpg", "jpeg"}, message = "Only PNG, JPG, and JPEG files are allowed")
    @ValidContentType(types = {"image/png", "image/jpg", "image/jpeg"}, message = "Only image files are allowed")
    private MultipartFile image;

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
} 