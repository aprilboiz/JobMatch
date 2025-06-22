package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.annotation.ValidContentType;
import com.aprilboiz.jobmatch.annotation.ValidFileExtension;
import com.aprilboiz.jobmatch.annotation.ValidFileSize;
import com.aprilboiz.jobmatch.dto.response.ImageUploadResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.model.*;
import com.aprilboiz.jobmatch.service.CloudinaryService;
import com.aprilboiz.jobmatch.service.CompanyService;
import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Image Management", description = "Operations for uploading and managing images (avatars and company logos)")
public class ImageController {

    private final CloudinaryService cloudinaryService;
    private final UserService userService;
    private final CompanyService companyService;
    private final MessageService messageService;
    private final Executor imageUploadExecutor;

    @Operation(
            summary = "Upload User Avatar",
            description = """
                    Upload a new avatar image for the authenticated user.
                    
                    This endpoint allows authenticated users to upload a profile picture:
                    - Supports PNG, JPG, and JPEG formats
                    - Maximum file size: 5MB
                    - Images are automatically optimized and stored in Cloudinary
                    - Previous avatar is automatically deleted when uploading a new one
                    - Upload is processed asynchronously for better performance
                    
                    The uploaded image will be associated with the user's profile and can be 
                    accessed through the user profile endpoints.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Avatar uploaded successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid file format, size, or content",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "413",
                    description = "File too large",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping(value = "/users/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('CANDIDATE', 'RECRUITER')")
    public DeferredResult<ResponseEntity<ApiResponse<ImageUploadResponse>>> uploadUserAvatar(
            @Parameter(description = "User ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(
                    description = "Avatar image file (PNG, JPG, JPEG - max 5MB)",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestParam("avatar")
            @ValidFileSize(maxSize = 5242880L) // 5MB
            @ValidFileExtension(extensions = {"png", "jpg", "jpeg"})
            @ValidContentType(types = {"image/png", "image/jpeg"})
            MultipartFile avatar,
            @AuthenticationPrincipal UserPrincipalAdapter userPrincipal) {

        // Create DeferredResult with 30 second timeout
        DeferredResult<ResponseEntity<ApiResponse<ImageUploadResponse>>> deferredResult = 
            new DeferredResult<>(30000L);

        // Get the current user
        User currentUser = userPrincipal.getUser();
        
        // Ensure a user can only upload their own avatar (unless admin)
        if (!currentUser.getId().equals(id) && !hasAdminRole(currentUser)) {
            deferredResult.setErrorResult(
                ResponseEntity.status(403).body(
                    ApiResponse.error(messageService.getMessage("error.authorization.user.required"))
                )
            );
            return deferredResult;
        }

        log.info("Starting async avatar upload for user: {}, file: {}", id, avatar.getOriginalFilename());

        // Upload to Cloudinary avatars folder asynchronously
        CompletableFuture<String> uploadFuture = cloudinaryService.uploadAsync(avatar, "avatars");
        
        uploadFuture
            .thenCompose(avatarUrl -> {
                log.info("Avatar upload completed for user: {}, URL: {}", id, avatarUrl);
                // Update the user's avatar URL asynchronously with security context
                return CompletableFuture.supplyAsync(() -> {
                    userService.updateUserAvatar(id, avatarUrl);
                    return avatarUrl;
                }, imageUploadExecutor);
            })
            .thenAccept(avatarUrl -> {
                ImageUploadResponse response = ImageUploadResponse.builder()
                        .imageUrl(avatarUrl)
                        .uploadedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                        .build();

                String successMessage = messageService.getMessage("api.success.avatar.uploaded");
                deferredResult.setResult(ResponseEntity.ok(ApiResponse.success(successMessage, response)));
                log.info("Avatar upload process completed successfully for user: {}", id);
            })
            .exceptionally(throwable -> {
                log.error("Avatar upload failed for user: {}", id, throwable);
                String errorMessage = messageService.getMessage("storage.failed", "upload avatar");
                deferredResult.setErrorResult(
                    ResponseEntity.status(500).body(ApiResponse.error(errorMessage))
                );
                return null;
            });

        // Set timeout handler
        deferredResult.onTimeout(() -> {
            log.warn("Avatar upload timeout for user: {}", id);
            String timeoutMessage = messageService.getMessage("api.error.timeout", "Avatar upload");
            deferredResult.setErrorResult(
                ResponseEntity.status(408).body(ApiResponse.error(timeoutMessage))
            );
        });

        return deferredResult;
    }

    @Operation(
            summary = "Upload Company Logo",
            description = """
                    Upload a new logo image for a company.
                    
                    This endpoint allows authorized users to upload a company logo:
                    - Only recruiters associated with the company can upload logos
                    - Supports PNG, JPG, and JPEG formats
                    - Maximum file size: 5MB
                    - Images are automatically optimized and stored in Cloudinary
                    - Previous logo is automatically deleted when uploading a new one
                    - Upload is processed asynchronously for better performance
                    
                    The uploaded logo will be displayed on the company profile and job postings.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Company logo uploaded successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid file format, size, or content",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User is not authorized to update this company",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Company not found",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "413",
                    description = "File too large",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping(value = "/companies/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('RECRUITER')")
    public DeferredResult<ResponseEntity<ApiResponse<ImageUploadResponse>>> uploadCompanyLogo(
            @Parameter(description = "Company ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(
                    description = "Company logo image file (PNG, JPG, JPEG - max 5MB)",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestParam("logo")
            @ValidFileSize(maxSize = 5242880L) // 5MB
            @ValidFileExtension(extensions = {"png", "jpg", "jpeg"})
            @ValidContentType(types = {"image/png", "image/jpeg"})
            MultipartFile logo,
            @AuthenticationPrincipal UserPrincipalAdapter userPrincipal) {

        // Create DeferredResult with 30 second timeout
        DeferredResult<ResponseEntity<ApiResponse<ImageUploadResponse>>> deferredResult = 
            new DeferredResult<>(30000L);

        // Get the current user
        User currentUser = userPrincipal.getUser();
        
        // Ensure only recruiters from this company can upload the logo (unless admin)
        if (!isCompanyRecruiter(id, currentUser) && !hasAdminRole(currentUser)) {
            deferredResult.setErrorResult(
                ResponseEntity.status(403).body(
                    ApiResponse.error(messageService.getMessage("error.authorization.recruiter.required"))
                )
            );
            return deferredResult;
        }

        log.info("Starting async logo upload for company: {}, file: {}", id, logo.getOriginalFilename());

        // Upload to Cloudinary logos folder asynchronously
        CompletableFuture<String> uploadFuture = cloudinaryService.uploadAsync(logo, "logos");
        
        uploadFuture
            .thenCompose(logoUrl -> {
                log.info("Logo upload completed for company: {}, URL: {}", id, logoUrl);
                // Update company's logo URL asynchronously with security context
                return CompletableFuture.supplyAsync(() -> {
                    companyService.updateCompanyLogo(id, logoUrl);
                    return logoUrl;
                }, imageUploadExecutor);
            })
            .thenAccept(logoUrl -> {
                ImageUploadResponse response = ImageUploadResponse.builder()
                        .imageUrl(logoUrl)
                        .uploadedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                        .build();

                String successMessage = messageService.getMessage("api.success.logo.uploaded");
                deferredResult.setResult(ResponseEntity.ok(ApiResponse.success(successMessage, response)));
                log.info("Logo upload process completed successfully for company: {}", id);
            })
            .exceptionally(throwable -> {
                log.error("Logo upload failed for company: {}", id, throwable);
                String errorMessage = messageService.getMessage("storage.failed", "upload company logo");
                deferredResult.setErrorResult(
                    ResponseEntity.status(500).body(ApiResponse.error(errorMessage))
                );
                return null;
            });

        // Set timeout handler
        deferredResult.onTimeout(() -> {
            log.warn("Logo upload timeout for company: {}", id);
            String timeoutMessage = messageService.getMessage("api.error.timeout", "Logo upload");
            deferredResult.setErrorResult(
                ResponseEntity.status(408).body(ApiResponse.error(timeoutMessage))
            );
        });

        return deferredResult;
    }

    public boolean isUserOwnerOrAdmin(Long userId, org.springframework.security.core.Authentication authentication) {
        UserPrincipalAdapter userPrincipal = (UserPrincipalAdapter) authentication.getPrincipal();
        User currentUser = userPrincipal.getUser();
        
        return currentUser.getId().equals(userId) || hasAdminRole(currentUser);
    }

    public boolean isCompanyRecruiter(Long companyId, User user) {
        if (user instanceof Recruiter recruiter) {
            return recruiter.getCompany() != null && recruiter.getCompany().getId().equals(companyId);
        }
        return false;
    }

    private boolean hasAdminRole(User user) {
        return user.getRole().getName().name().equals("ADMIN");
    }
} 