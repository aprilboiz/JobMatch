package com.aprilboiz.jobmatch.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Testing", description = "Endpoints for testing")
public class TestController {
    
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
} 