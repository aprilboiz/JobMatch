package com.aprilboiz.jobmatch.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.aprilboiz.jobmatch.controller.AuthController;
import com.aprilboiz.jobmatch.dto.request.AuthRequest;
import com.aprilboiz.jobmatch.dto.request.LogoutRequest;
import com.aprilboiz.jobmatch.dto.request.RefreshTokenRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.dto.response.AuthResponse;
import com.aprilboiz.jobmatch.dto.response.UserResponse;
import com.aprilboiz.jobmatch.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;


@WebMvcTest(AuthController.class)
@Import(com.aprilboiz.jobmatch.config.TestSecurityConfig.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Authentication Controller Web Layer Tests")
class AuthControllerWebTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;
    
    @MockitoBean
    private com.aprilboiz.jobmatch.service.JwtService jwtService;
    
    @MockitoBean
    private com.aprilboiz.jobmatch.service.TokenBlacklistService tokenBlacklistService;

    @Nested
    @DisplayName("Login Endpoint HTTP Layer Tests")
    @Order(1)
    class LoginHttpTests {

        @Test
        @Order(10)
        @DisplayName("Should return correct JSON structure for successful login")
        void shouldReturnCorrectJsonStructureForSuccessfulLogin() throws Exception {
            // Given - Mock service response
            UserResponse userResponse = UserResponse.builder()
                    .id(1L)
                    .email("test@example.com")
                    .build();

            AuthResponse authResponse = AuthResponse.builder()
                    .token("access-token")
                    .refreshToken("refresh-token")
                    .user(userResponse)
                    .expiresIn(3600L)
                    .build();

            when(authService.login(any(AuthRequest.class))).thenReturn(authResponse);

            AuthRequest validRequest = new AuthRequest();
            validRequest.setEmail("test@example.com");
            validRequest.setPassword("password123");

            // When & Then - Test JSON structure
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Login successful"))
                    .andExpect(jsonPath("$.data.token").value("access-token"))
                    .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                    .andExpect(jsonPath("$.data.user.email").value("test@example.com"))
                    .andExpect(jsonPath("$.data.expiresIn").value(3600))
                    .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
        }

        @Test
        @Order(11)
        @DisplayName("Should map service exceptions to correct HTTP status codes")
        void shouldMapServiceExceptionsToCorrectHttpStatusCodes() throws Exception {
            // Given - Mock service exception
            when(authService.login(any(AuthRequest.class)))
                    .thenThrow(new BadCredentialsException("Invalid credentials"));

            AuthRequest request = new AuthRequest();
            request.setEmail("test@example.com");
            request.setPassword("wrongpassword");

            // When & Then - Test exception mapping
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Invalid credentials"));
        }

        @Test
        @Order(12)
        @DisplayName("Should validate request content-type requirements")
        void shouldValidateRequestContentTypeRequirements() throws Exception {
            AuthRequest request = new AuthRequest();
            request.setEmail("test@example.com");
            request.setPassword("password123");

            // Test unsupported media type
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.TEXT_PLAIN)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnsupportedMediaType());

            // Test missing content type  
            mockMvc.perform(post("/api/auth/login")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnsupportedMediaType());
        }

        @Test
        @Order(13)
        @DisplayName("Should handle malformed JSON gracefully")
        void shouldHandleMalformedJsonGracefully() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{invalid json}"))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any(AuthRequest.class));
        }

        @Test
        @Order(14)
        @DisplayName("Should validate required request fields")
        void shouldValidateRequiredRequestFields() throws Exception {
            // Missing email
            AuthRequest missingEmail = new AuthRequest();
            missingEmail.setPassword("password123");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(missingEmail)))
                    .andExpect(status().isBadRequest());

            // Missing password
            AuthRequest missingPassword = new AuthRequest();
            missingPassword.setEmail("test@example.com");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(missingPassword)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any(AuthRequest.class));
        }
    }

    @Nested
    @DisplayName("Registration Endpoint HTTP Layer Tests")
    @Order(2)
    class RegistrationHttpTests {

        @Test
        @Order(20)
        @DisplayName("Should return correct status code for successful registration")
        void shouldReturnCorrectStatusCodeForSuccessfulRegistration() throws Exception {
            // Given - Mock service success
            doNothing().when(authService).register(any(RegisterRequest.class));

            RegisterRequest validRequest = createValidRegisterRequest();

            // When & Then - Test status code
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("User registered successfully"));

            verify(authService, times(1)).register(any(RegisterRequest.class));
        }

        @Test
        @Order(21)
        @DisplayName("Should validate email format in request binding")
        void shouldValidateEmailFormatInRequestBinding() throws Exception {
            RegisterRequest invalidEmail = createValidRegisterRequest();
            invalidEmail.setEmail("invalid-email-format");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidEmail)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any(RegisterRequest.class));
        }

        @Test
        @Order(22)
        @DisplayName("Should validate required fields in request binding")
        void shouldValidateRequiredFieldsInRequestBinding() throws Exception {
            // Test each required field
            RegisterRequest missingEmail = createValidRegisterRequest();
            missingEmail.setEmail(null);

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(missingEmail)))
                    .andExpect(status().isBadRequest());

            RegisterRequest missingPassword = createValidRegisterRequest();
            missingPassword.setPassword(null);

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(missingPassword)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any(RegisterRequest.class));
        }

        private RegisterRequest createValidRegisterRequest() {
            RegisterRequest request = new RegisterRequest();
            request.setEmail("test@example.com");
            request.setPassword("password123");
            request.setFullName("Test User");
            request.setPhoneNumber("1234567890");
            request.setRole("CANDIDATE");
            return request;
        }
    }

    @Nested
    @DisplayName("Token Refresh Endpoint HTTP Layer Tests")
    @Order(3)
    class RefreshTokenHttpTests {

        @Test
        @Order(30)
        @DisplayName("Should return correct JSON structure for token refresh")
        void shouldReturnCorrectJsonStructureForTokenRefresh() throws Exception {
            // Given - Mock service response
            AuthResponse refreshResponse = AuthResponse.builder()
                    .token("new-access-token")
                    .refreshToken("new-refresh-token")
                    .expiresIn(3600L)
                    .build();

            when(authService.refreshToken(any(RefreshTokenRequest.class))).thenReturn(refreshResponse);

            RefreshTokenRequest validRequest = new RefreshTokenRequest();
            validRequest.setRefreshToken("valid-refresh-token");

            // When & Then - Test JSON structure
            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Token refreshed successfully"))
                    .andExpect(jsonPath("$.data.token").value("new-access-token"))
                    .andExpect(jsonPath("$.data.refreshToken").value("new-refresh-token"))
                    .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
        }

        @Test
        @Order(31)
        @DisplayName("Should validate refresh token request binding")
        void shouldValidateRefreshTokenRequestBinding() throws Exception {
            // Missing refresh token
            RefreshTokenRequest missingToken = new RefreshTokenRequest();

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(missingToken)))
                    .andExpect(status().isBadRequest());

            // Empty refresh token
            RefreshTokenRequest emptyToken = new RefreshTokenRequest();
            emptyToken.setRefreshToken("");

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(emptyToken)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).refreshToken(any(RefreshTokenRequest.class));
        }
    }

    @Nested
    @DisplayName("Logout Endpoint HTTP Layer Tests")
    @Order(4)
    class LogoutHttpTests {

        @Test
        @Order(40)
        @DisplayName("Should return correct status for successful logout")
        void shouldReturnCorrectStatusForSuccessfulLogout() throws Exception {
            // Given - Mock service success
            doNothing().when(authService).logout(any(LogoutRequest.class));

            LogoutRequest validRequest = new LogoutRequest();
            validRequest.setAccessToken("access-token");
            validRequest.setRefreshToken("refresh-token");

            // When & Then - Test status code
            mockMvc.perform(post("/api/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Logout successful"));

            verify(authService, times(1)).logout(any(LogoutRequest.class));
        }

        @Test
        @Order(41)
        @DisplayName("Should validate logout request binding")
        void shouldValidateLogoutRequestBinding() throws Exception {
            // Missing access token
            LogoutRequest missingAccessToken = new LogoutRequest();
            missingAccessToken.setRefreshToken("refresh-token");

            mockMvc.perform(post("/api/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(missingAccessToken)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).logout(any(LogoutRequest.class));
        }
    }

    @Nested
    @DisplayName("General HTTP Handling Tests")
    @Order(5)
    class GeneralHttpTests {

        @Test
        @Order(50)
        @DisplayName("Should handle empty request body")
        void shouldHandleEmptyRequestBody() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @Order(51)
        @DisplayName("Should handle large request payload")
        void shouldHandleLargeRequestPayload() throws Exception {
            AuthRequest largeRequest = new AuthRequest();
            largeRequest.setEmail("test@example.com");
            largeRequest.setPassword("x".repeat(10000)); // Very long password

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(largeRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @Order(52)
        @DisplayName("Should handle special characters in JSON")
        void shouldHandleSpecialCharactersInJson() throws Exception {
            AuthRequest specialCharsRequest = new AuthRequest();
            specialCharsRequest.setEmail("test+tag@example.com");
            specialCharsRequest.setPassword("pass@#$%^&*()_+word");

            when(authService.login(any(AuthRequest.class))).thenReturn(
                AuthResponse.builder()
                    .token("token")
                    .refreshToken("refresh")
                    .expiresIn(3600L)
                    .build()
            );

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(specialCharsRequest)))
                    .andExpect(status().isOk());
        }
    }
} 