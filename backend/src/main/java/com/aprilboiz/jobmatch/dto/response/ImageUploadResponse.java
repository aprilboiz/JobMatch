package com.aprilboiz.jobmatch.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Image upload response")
public class ImageUploadResponse {
    
    @Schema(description = "The uploaded image URL", example = "https://res.cloudinary.com/example/image/upload/v1234567890/avatars/uuid.jpg")
    private String imageUrl;
    
    @Schema(description = "Upload timestamp", example = "2024-01-15T10:30:00")
    private String uploadedAt;
} 