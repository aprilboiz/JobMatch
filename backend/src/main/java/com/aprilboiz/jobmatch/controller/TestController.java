package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import com.aprilboiz.jobmatch.storage.StorageService;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import com.aprilboiz.jobmatch.model.UserPrincipalAdapter;
import com.aprilboiz.jobmatch.service.UserService;
import com.aprilboiz.jobmatch.service.CloudinaryService;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.dto.response.ImageUploadResponse;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Testing", description = "Development and testing endpoints for system validation, role-based access testing, and functionality verification")
public class TestController {

    private final StorageService storageService;
    private final MessageService messageService;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private static final Logger log = LoggerFactory.getLogger(TestController.class);

    public TestController(StorageService storageService, MessageService messageService, UserService userService, CloudinaryService cloudinaryService) {
        this.storageService = storageService;
        this.messageService = messageService;
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
    }

    @Operation(
            summary = "Hello World",
            description = """
                    Simple health check endpoint to verify the server is running and responding.
                    
                    This is a public endpoint that returns a basic success message.
                    Useful for:
                    - Server health monitoring
                    - API connectivity testing
                    - Load balancer health checks
                    """
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Server is working properly",
                    content = @Content(schema = @Schema(type = "string", example = "Server is working!"))
            )
    })
    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Server is working!");
    }
    
    @Operation(
            summary = "Echo Test",
            description = """
                    Echo endpoint that returns the received JSON payload.
                    
                    This endpoint is useful for:
                    - Testing request/response handling
                    - Validating JSON serialization/deserialization
                    - Network connectivity testing
                    - Client-side debugging
                    
                    Accepts any valid JSON object and returns it along with a success message.
                    """
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Echo test successful",
                    content = @Content(schema = @Schema(implementation = Map.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid JSON format",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(
            @Parameter(description = "JSON payload to echo back", required = true)
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
            "received", body,
            "message", "Echo test successful"
        ));
    }

    @Operation(
            summary = "Admin Access Test",
            description = """
                    Test endpoint to verify admin role access control.
                    
                    This endpoint requires ADMIN role and is used to:
                    - Validate JWT authentication
                    - Test role-based authorization
                    - Verify admin privileges
                    
                    Only users with ADMIN role can access this endpoint.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Admin access granted",
                    content = @Content(schema = @Schema(type = "string", example = "Admin access granted"))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have ADMIN role",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> admin() {
        return ResponseEntity.ok("Admin access granted");
    }

    @Operation(
            summary = "Recruiter Access Test",
            description = """
                    Test endpoint to verify recruiter role access control.
                    
                    This endpoint requires RECRUITER role and is used to:
                    - Validate JWT authentication for recruiters
                    - Test recruiter-specific authorization
                    - Verify recruiter privileges
                    
                    Only users with RECRUITER role can access this endpoint.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Recruiter access granted",
                    content = @Content(schema = @Schema(type = "string", example = "Recruiter access granted"))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have RECRUITER role",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<String> recruiter() {
        return ResponseEntity.ok("Recruiter access granted");
    }

    @Operation(
            summary = "Candidate Access Test",
            description = """
                    Test endpoint to verify candidate role access control.
                    
                    This endpoint requires CANDIDATE role and is used to:
                    - Validate JWT authentication for candidates
                    - Test candidate-specific authorization
                    - Verify candidate privileges
                    
                    Only users with CANDIDATE role can access this endpoint.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Candidate access granted",
                    content = @Content(schema = @Schema(type = "string", example = "Candidate access granted"))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have CANDIDATE role",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/candidate")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<String> candidate() {
        return ResponseEntity.ok("Candidate access granted");
    }

    @Operation(
            summary = "All Roles Access Test",
            description = """
                    Test endpoint to verify multi-role access control.
                    
                    This endpoint accepts any authenticated user with one of the valid roles:
                    - ADMIN: Full system access
                    - RECRUITER: Employer access
                    - CANDIDATE: Job seeker access
                    
                    Used to test that authentication works for all user types.
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Access granted for authenticated user",
                    content = @Content(schema = @Schema(type = "string", example = "All access granted"))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - Invalid or missing token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have any valid role",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'CANDIDATE')")
    public ResponseEntity<String> all() {
        return ResponseEntity.ok("All access granted");
    }

    @Operation(
            summary = "File Upload Test",
            description = """
                    Test endpoint for file upload functionality.
                    
                    This endpoint allows testing of:
                    - Multipart file upload handling
                    - File storage service integration
                    - File validation and processing
                    - Storage path generation
                    
                    **Note:** This is a development endpoint and should not be used in production.
                    The uploaded files are stored using the configured storage service.
                    
                    **File Requirements:**
                    - Any file type accepted for testing
                    - File size limits apply based on server configuration
                    """,
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "File uploaded successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid file or upload error",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "413",
                    description = "File too large",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> upload(
            @Parameter(
                    description = "File to upload for testing",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestParam("file") MultipartFile file) {
        String filePath = storageService.store(file);
        URI uri = UriComponentsBuilder.fromPath("/api/files/").path("/{id}").buildAndExpand(filePath).toUri();
        System.out.println("Original filename: " + file.getOriginalFilename());
        System.out.println("Generated URI: " + uri);
        System.out.println("Content type: " + file.getContentType());
        System.out.println("Stored path: " + filePath);
        System.out.println("File size: " + file.getSize() + " bytes");
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Test Internationalization",
            description = """
                    Test endpoint to verify internationalization (i18n) functionality.
                    
                    This endpoint demonstrates:
                    - Message localization based on Accept-Language header
                    - Current locale detection
                    - Message key resolution
                    - Multi-language support
                    
                    **Supported Languages:**
                    - English (en) - Default
                    - Vietnamese (vi)
                    
                    Use the Accept-Language header to test different languages:
                    - `Accept-Language: en` for English
                    - `Accept-Language: vi` for Vietnamese
                    """
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Internationalization test completed successfully",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping("/test-lang")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testInternationalization() {
        Map<String, Object> testMessages = new HashMap<>();
        testMessages.put("login_success", messageService.getMessage("api.success.login"));
        testMessages.put("register_success", messageService.getMessage("api.success.register"));
        testMessages.put("validation_email_required", messageService.getMessage("validation.required.email"));
        testMessages.put("validation_password_required", messageService.getMessage("validation.required.password"));
        testMessages.put("current_locale", messageService.getCurrentLocale().toString());

        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, testMessages));
    }

    @PostMapping("/sync-avatar/{id}")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'RECRUITER')")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadAvatarSync(
            @PathVariable Long id,
            @RequestParam("avatar") MultipartFile avatar,
            @AuthenticationPrincipal UserPrincipalAdapter userPrincipal) {
        
        try {
            // Get the current user
            User currentUser = userPrincipal.getUser();
            log.info("Sync upload - Current user: {}, Target ID: {}", currentUser.getId(), id);
            
            // Check authorization
            if (!currentUser.getId().equals(id)) {
                return ResponseEntity.status(403).body(
                    ApiResponse.error("You can only upload your own avatar")
                );
            }
            
            // Upload synchronously
            String avatarUrl = cloudinaryService.upload(avatar, "avatars");
            log.info("Sync upload completed: {}", avatarUrl);
            
            // Update user avatar
            userService.updateUserAvatar(id, avatarUrl);
            log.info("User avatar updated successfully");
            
            ImageUploadResponse response = ImageUploadResponse.builder()
                    .imageUrl(avatarUrl)
                    .uploadedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", response));
            
        } catch (Exception e) {
            log.error("Sync avatar upload failed for user: {}", id, e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("Upload failed: " + e.getMessage())
            );
        }
    }
} 