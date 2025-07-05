package com.aprilboiz.jobmatch.controller;

import com.aprilboiz.jobmatch.dto.request.AuthRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.dto.response.AuthResponse;
import com.aprilboiz.jobmatch.exception.ApiResponse;
import com.aprilboiz.jobmatch.service.AuthService;
import com.aprilboiz.jobmatch.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;

@RestController
@RequestMapping("/api/auth")
@Slf4j
@Tag(name = "Authentication", description = "Authentication and authorization operations including login, registration, token refresh, and logout")
public class AuthController {
    private final AuthService authService;
    private final MessageService messageService;

    public AuthController(AuthService authService, MessageService messageService) {
        this.authService = authService;
        this.messageService = messageService;
    }

    @Operation(
            summary = "User Login",
            description = "Authenticate user with email and password. Returns JWT access token and refresh token for authenticated sessions."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401", 
                    description = "Invalid credentials", 
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", 
                    description = "Invalid request data", 
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody @Valid AuthRequest authRequest) {
        AuthResponse response = authService.login(authRequest);
        String successMessage = messageService.getMessage("api.success.login");

        // set refresh token as HttpOnly cookie
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
            .httpOnly(true)
            .secure(false) // Set to true in production
            .path("/api/auth/refresh")
            .maxAge(7 * 24 * 60 * 60) // 7 days
            .sameSite("Lax")
            .build();

        // remove refreshToken from response body
        AuthResponse filteredResponse = AuthResponse.builder()
            .token(response.getToken())
            .expiresIn(response.getExpiresIn())
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
            .body(ApiResponse.success(successMessage, filteredResponse));
    }

    @Operation(
            summary = "User Registration",
            description = "Register a new user account. Users can register as CANDIDATE, RECRUITER, or ADMIN. Email must be unique."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409", 
                    description = "Email already exists",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", 
                    description = "Invalid request data",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody @Valid RegisterRequest registerRequest) {
        authService.register(registerRequest);
        String successMessage = messageService.getMessage("api.success.register");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(successMessage, null));
    }

    @Operation(
            summary = "Refresh Access Token",
            description = "Generate a new access token using a valid refresh token. This endpoint extends the user's session without requiring re-authentication."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401", 
                    description = "Missing or invalid refresh token",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@CookieValue(name = "refreshToken") String refreshToken) {
        log.info("Refresh token request received");
        
        // Check if refresh token is missing
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(messageService.getMessage("api.error.refresh.token.missing")));
        }

        // Refresh token
        AuthResponse response = authService.refreshToken(refreshToken);
        String successMessage = messageService.getMessage("api.success.token.refresh");

        // Create filtered response
        AuthResponse filteredResponse = AuthResponse.builder()
            .token(response.getToken())
            .expiresIn(response.getExpiresIn())
            .build();

        return ResponseEntity.ok()
            .body(ApiResponse.success(successMessage, filteredResponse));
    }

    @Operation(
            summary = "User Logout",
            description = "Invalidate the user's refresh token and log them out of the system. The access token will remain valid until expiration."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", 
                    description = "Invalid request data",
                    content = @Content(schema = @Schema(implementation = ApiResponse.Error.class))
            )
    })
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            @RequestHeader("Authorization") String authorizationHeader) {
        
        // Extract access token from Authorization header
        String accessToken = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            accessToken = authorizationHeader.substring(7);
        }
        
        if (accessToken == null) {
            throw new BadCredentialsException("Access token required");
        }
        
        // Blacklist both tokens
        authService.logout(accessToken, refreshToken);
        
        // Clear the refresh token cookie
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
            .httpOnly(true)
            .secure(false)
            .path("/api/auth/refresh")
            .maxAge(0)
            .sameSite("Lax")
            .build();
        
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
            .body(ApiResponse.success("Logout successful", null));
    }
}
