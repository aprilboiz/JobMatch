package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@RestController
@RequestMapping("/api/test")
@Tag(name = "Testing", description = "Endpoints for testing")
public class TestController {

    private final StorageService storageService;
    private final MessageService messageService;

    public TestController(StorageService storageService, MessageService messageService) {
        this.storageService = storageService;
        this.messageService = messageService;
    }

    @Operation(summary = "Hello World", description = "Simple hello world")
    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Server is working!");
    }
    
    @Operation(summary = "Echo Test", description = "Echo endpoint that returns the received JSON payload. Useful for testing request/response handling.")
    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
            "received", body,
            "message", "Echo test successful"
        ));
    }

    @Operation(
            summary = "Admin Access Test",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> admin() {
        return ResponseEntity.ok("Admin access granted");
    }

    @Operation(
            summary = "Recruiter Access Test",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<String> recruiter() {
        return ResponseEntity.ok("Recruiter access granted");
    }

    @Operation(
            summary = "Candidate Access Test",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/candidate")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<String> candidate() {
        return ResponseEntity.ok("Candidate access granted");
    }

    @Operation(
            summary = "All Roles Access Test",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'CANDIDATE')")
    public ResponseEntity<String> all() {
        return ResponseEntity.ok("All access granted");
    }

    @PostMapping("/upload")
    public ResponseEntity<Void> upload(@RequestParam("file") MultipartFile file) {
        // return ResponseEntity.ok(storageService.store(file));
        String filePath = storageService.store(file);
        URI uri = UriComponentsBuilder.fromPath("/api/files/").path("/{id}").buildAndExpand(filePath).toUri();
        System.out.println(file.getOriginalFilename());
        System.out.println(uri);
        System.out.println(file.getContentType());
        System.out.println(filePath);
        System.out.println(file.getSize());
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Test Internationalization"
    )
    @GetMapping("/test-lang")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testInternationalization() {
        Map<String, Object> testMessages = new HashMap<>();
        testMessages.put("login_success", messageService.getMessage("api.success.login"));
        testMessages.put("register_success", messageService.getMessage("api.success.register"));
        testMessages.put("validation_email_required", messageService.getMessage("validation.email.required"));
        testMessages.put("validation_password_required", messageService.getMessage("validation.password.required"));
        testMessages.put("current_locale", messageService.getCurrentLocale().toString());

        String successMessage = messageService.getMessage("operation.completed");
        return ResponseEntity.ok(ApiResponse.success(successMessage, testMessages));
    }
} 