package com.aprilboiz.jobmatch.controller;

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
public class TestController {
    
    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Server is working!");
    }
    
    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
            "received", body,
            "message", "Echo test successful"
        ));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> admin() {
        return ResponseEntity.ok("Admin access granted");
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<String> recruiter() {
        return ResponseEntity.ok("Recruiter access granted");
    }

    @GetMapping("/candidate")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<String> candidate() {
        return ResponseEntity.ok("Candidate access granted");
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER', 'CANDIDATE')")
    public ResponseEntity<String> all() {
        return ResponseEntity.ok("All access granted");
    }
} 