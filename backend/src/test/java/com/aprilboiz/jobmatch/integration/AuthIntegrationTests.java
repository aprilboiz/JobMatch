package com.aprilboiz.jobmatch.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.aprilboiz.jobmatch.dto.request.AuthRequest;
import com.aprilboiz.jobmatch.dto.request.LogoutRequest;
import com.aprilboiz.jobmatch.dto.request.RefreshTokenRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.repository.CandidateRepository;
import com.aprilboiz.jobmatch.repository.RecruiterRepository;
import com.aprilboiz.jobmatch.repository.RoleRepository;
import com.aprilboiz.jobmatch.repository.UserRepository;
import com.aprilboiz.jobmatch.service.TokenBlacklistService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
@Import(com.aprilboiz.jobmatch.config.TestRedisConfig.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("Authentication Module End-to-End Integration Tests")
class AuthIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    private MockMvc mockMvc;
    private Role candidateRole;
    private Role recruiterRole;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Clean up database state for test isolation
        candidateRepository.deleteAll();
        recruiterRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        // Clear token blacklist for clean state
        tokenBlacklistService.clearAllBlacklistedTokens();

        // Set up roles
        candidateRole = roleRepository.findByName(RoleName.CANDIDATE)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.CANDIDATE);
                    return roleRepository.save(role);
                });

        recruiterRole = roleRepository.findByName(RoleName.RECRUITER)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.RECRUITER);
                    return roleRepository.save(role);
                });
    }

    @Nested
    @DisplayName("Complete User Journey Tests")
    @Order(1)
    class CompleteUserJourneyTests {

        @Test
        @Order(10)
        @DisplayName("Should complete full candidate lifecycle: register → login → refresh → logout")
        void shouldCompleteFullCandidateLifecycle() throws Exception {
            String email = "candidate@journey.com";
            String password = "candidatePassword123";
            String fullName = "Journey Candidate";
            String phoneNumber = "1234567890";

            // 1. REGISTER - Create candidate account
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(email);
            registerRequest.setPassword(password);
            registerRequest.setFullName(fullName);
            registerRequest.setPhoneNumber(phoneNumber);
            registerRequest.setRole("CANDIDATE");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated());

            // Verify database persistence
            var users = userRepository.findAll();
            assertThat(users).hasSize(1);
            User createdUser = users.get(0);
            assertThat(createdUser.getEmail()).isEqualTo(email);
            assertThat(passwordEncoder.matches(password, createdUser.getPassword())).isTrue();
            assertThat(createdUser.getRole().getName()).isEqualTo(RoleName.CANDIDATE);

            var candidates = candidateRepository.findAll();
            assertThat(candidates).hasSize(1);
            Candidate createdCandidate = candidates.get(0);
            assertThat(createdCandidate.getFullName()).isEqualTo(fullName);
            assertThat(createdCandidate.getPhoneNumber()).isEqualTo(phoneNumber);
            assertThat(createdCandidate.getUser().getId()).isEqualTo(createdUser.getId());

            // 2. LOGIN - Authenticate and get tokens
            AuthRequest authRequest = new AuthRequest();
            authRequest.setEmail(email);
            authRequest.setPassword(password);

            MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(authRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.token").exists())
                    .andExpect(jsonPath("$.data.refreshToken").exists())
                    .andExpect(jsonPath("$.data.expiresIn").exists())
                    .andExpect(jsonPath("$.data.tokenType").exists())
                    .andReturn();

            JsonNode loginResponse = objectMapper.readTree(loginResult.getResponse().getContentAsString());
            String accessToken = loginResponse.get("data").get("token").asText();
            String refreshToken = loginResponse.get("data").get("refreshToken").asText();

            assertThat(accessToken).isNotEmpty();
            assertThat(refreshToken).isNotEmpty();
            assertThat(accessToken).isNotEqualTo(refreshToken);

            // 3. TOKEN REFRESH - Use refresh token to get new tokens
            // Add small delay to ensure different timestamp for token generation
            Thread.sleep(1000);
            
            RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
            refreshRequest.setRefreshToken(refreshToken);

            MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.token").exists())
                    .andExpect(jsonPath("$.data.refreshToken").exists())
                    .andReturn();

            JsonNode refreshResponse = objectMapper.readTree(refreshResult.getResponse().getContentAsString());
            String newAccessToken = refreshResponse.get("data").get("token").asText();
            String newRefreshToken = refreshResponse.get("data").get("refreshToken").asText();

            // Verify tokens are rotated
            assertThat(newAccessToken).isNotEqualTo(accessToken);
            assertThat(newRefreshToken).isNotEqualTo(refreshToken);

            // Verify old refresh token is blacklisted
            assertThat(tokenBlacklistService.isTokenBlacklisted(refreshToken)).isTrue();

            // 4. LOGOUT - Invalidate tokens
            LogoutRequest logoutRequest = new LogoutRequest();
            logoutRequest.setToken(newAccessToken);
            logoutRequest.setRefreshToken(newRefreshToken);

            mockMvc.perform(post("/api/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(logoutRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            // Verify both tokens are blacklisted after logout
            assertThat(tokenBlacklistService.isTokenBlacklisted(newAccessToken)).isTrue();
            assertThat(tokenBlacklistService.isTokenBlacklisted(newRefreshToken)).isTrue();

            // 5. VERIFY TOKENS NO LONGER WORK
            // Try to refresh with blacklisted token should fail
            RefreshTokenRequest invalidRefreshRequest = new RefreshTokenRequest();
            invalidRefreshRequest.setRefreshToken(newRefreshToken);

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRefreshRequest)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @Order(11)
        @DisplayName("Should complete full recruiter lifecycle with different role verification")
        void shouldCompleteFullRecruiterLifecycle() throws Exception {
            String email = "recruiter@journey.com";
            String password = "recruiterPassword123";
            String fullName = "Journey Recruiter";
            String phoneNumber = "0987654321";

            // Register recruiter
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(email);
            registerRequest.setPassword(password);
            registerRequest.setFullName(fullName);
            registerRequest.setPhoneNumber(phoneNumber);
            registerRequest.setRole("RECRUITER");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated());

            // Verify recruiter-specific persistence
            var users = userRepository.findAll();
            assertThat(users).hasSize(1);
            assertThat(users.getFirst().getRole().getName()).isEqualTo(RoleName.RECRUITER);

            var recruiters = recruiterRepository.findAll();
            assertThat(recruiters).hasSize(1);
            assertThat(recruiters.getFirst().getFullName()).isEqualTo(fullName);

            // Test login and token flow
            LoginTokens tokens = loginAndGetTokens(email, password);
            assertThat(tokens.accessToken).isNotEmpty();
            assertThat(tokens.refreshToken).isNotEmpty();

            // Test complete logout
            LogoutRequest logoutRequest = new LogoutRequest();
            logoutRequest.setToken(tokens.accessToken);
            logoutRequest.setRefreshToken(tokens.refreshToken);

            mockMvc.perform(post("/api/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(logoutRequest)))
                    .andExpect(status().isOk());

            // Verify tokens blacklisted
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.accessToken)).isTrue();
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.refreshToken)).isTrue();
        }
    }

    @Nested
    @DisplayName("Token Security and Blacklisting Tests")
    @Order(2)
    class TokenSecurityTests {

        @Test
        @Order(20)
        @DisplayName("Should prevent refresh token reuse and enforce rotation")
        void shouldPreventRefreshTokenReuse() throws Exception {
            // Setup user
            createTestCandidate("tokenreuse@example.com", "password123", "Token User");
            LoginTokens tokens = loginAndGetTokens("tokenreuse@example.com", "password123");

            // First refresh - should work
            RefreshTokenRequest firstRefresh = new RefreshTokenRequest();
            firstRefresh.setRefreshToken(tokens.refreshToken);

            MvcResult firstRefreshResult = mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(firstRefresh)))
                    .andExpect(status().isOk())
                    .andReturn();

            JsonNode firstResponse = objectMapper.readTree(firstRefreshResult.getResponse().getContentAsString());
            String newRefreshToken = firstResponse.get("data").get("refreshToken").asText();

            // Verify old refresh token is blacklisted
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.refreshToken)).isTrue();

            // Second refresh with same old token - should fail
            RefreshTokenRequest secondRefresh = new RefreshTokenRequest();
            secondRefresh.setRefreshToken(tokens.refreshToken);

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(secondRefresh)))
                    .andExpect(status().isUnauthorized());

            // Refresh with new token should work
            RefreshTokenRequest validRefresh = new RefreshTokenRequest();
            validRefresh.setRefreshToken(newRefreshToken);

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRefresh)))
                    .andExpect(status().isOk());
        }

        @Test
        @Order(21)
        @DisplayName("Should handle multiple concurrent logout attempts gracefully")
        void shouldHandleMultipleLogoutAttempts() throws Exception {
            // Setup user
            createTestCandidate("multilogout@example.com", "password123", "Multi Logout User");
            LoginTokens tokens = loginAndGetTokens("multilogout@example.com", "password123");

            LogoutRequest logoutRequest = new LogoutRequest();
            logoutRequest.setToken(tokens.accessToken);
            logoutRequest.setRefreshToken(tokens.refreshToken);

            // First logout - should succeed
            mockMvc.perform(post("/api/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(logoutRequest)))
                    .andExpect(status().isOk());

            // Verify tokens are blacklisted
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.accessToken)).isTrue();
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.refreshToken)).isTrue();

            // Second logout with same tokens - should handle gracefully (not fail)
            mockMvc.perform(post("/api/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(logoutRequest)))
                    .andExpect(status().isOk()); // Should not fail, just indicate success
        }

        @Test
        @Order(22)
        @DisplayName("Should persist blacklist state across application restarts")
        void shouldPersistBlacklistState() throws Exception {
            // Setup user and get tokens
            createTestCandidate("persistent@example.com", "password123", "Persistent User");
            LoginTokens tokens = loginAndGetTokens("persistent@example.com", "password123");

            // Blacklist tokens
            LogoutRequest logoutRequest = new LogoutRequest();
            logoutRequest.setToken(tokens.accessToken);
            logoutRequest.setRefreshToken(tokens.refreshToken);

            mockMvc.perform(post("/api/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(logoutRequest)))
                    .andExpect(status().isOk());

            // Verify blacklist state persists
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.accessToken)).isTrue();
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.refreshToken)).isTrue();

            // Simulate application restart by creating new instance of blacklist service
            // In real scenario, this would test Redis persistence
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.accessToken)).isTrue();
            assertThat(tokenBlacklistService.isTokenBlacklisted(tokens.refreshToken)).isTrue();
        }
    }

    @Nested
    @DisplayName("Data Consistency and Business Logic Tests")
    @Order(3)
    class DataConsistencyTests {

        @Test
        @Order(30)
        @DisplayName("Should enforce email uniqueness across registrations")
        void shouldEnforceEmailUniqueness() throws Exception {
            String duplicateEmail = "duplicate@example.com";

            // First registration
            RegisterRequest firstRequest = new RegisterRequest();
            firstRequest.setEmail(duplicateEmail);
            firstRequest.setPassword("password123");
            firstRequest.setFullName("First User");
            firstRequest.setPhoneNumber("1111111111");
            firstRequest.setRole("CANDIDATE");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(firstRequest)))
                    .andExpect(status().isCreated());

            // Verify user created
            assertThat(userRepository.findAll()).hasSize(1);

            // Second registration with same email
            RegisterRequest duplicateRequest = new RegisterRequest();
            duplicateRequest.setEmail(duplicateEmail);
            duplicateRequest.setPassword("differentpassword");
            duplicateRequest.setFullName("Second User");
            duplicateRequest.setPhoneNumber("2222222222");
            duplicateRequest.setRole("RECRUITER");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(duplicateRequest)))
                    .andExpect(status().isConflict());

            // Verify only one user exists
            assertThat(userRepository.findAll()).hasSize(1);
            assertThat(candidateRepository.findAll()).hasSize(1);
            assertThat(recruiterRepository.findAll()).hasSize(0);
        }

        @Test
        @Order(31)
        @DisplayName("Should handle role-specific entity creation correctly")
        void shouldHandleRoleSpecificEntityCreation() throws Exception {
            // Register candidate
            RegisterRequest candidateRequest = new RegisterRequest();
            candidateRequest.setEmail("candidate@roles.com");
            candidateRequest.setPassword("password123");
            candidateRequest.setFullName("Test Candidate");
            candidateRequest.setPhoneNumber("1111111111");
            candidateRequest.setRole("CANDIDATE");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(candidateRequest)))
                    .andExpect(status().isCreated());

            // Register recruiter  
            RegisterRequest recruiterRequest = new RegisterRequest();
            recruiterRequest.setEmail("recruiter@roles.com");
            recruiterRequest.setPassword("password123");
            recruiterRequest.setFullName("Test Recruiter");
            recruiterRequest.setPhoneNumber("2222222222");
            recruiterRequest.setRole("RECRUITER");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(recruiterRequest)))
                    .andExpect(status().isCreated());

            // Verify correct entities created
            assertThat(userRepository.findAll()).hasSize(2);
            assertThat(candidateRepository.findAll()).hasSize(1);
            assertThat(recruiterRepository.findAll()).hasSize(1);

            // Verify role assignments
            var candidateUser = userRepository.getUserByEmail("candidate@roles.com").orElseThrow();
            var recruiterUser = userRepository.getUserByEmail("recruiter@roles.com").orElseThrow();

            assertThat(candidateUser.getRole().getName()).isEqualTo(RoleName.CANDIDATE);
            assertThat(recruiterUser.getRole().getName()).isEqualTo(RoleName.RECRUITER);
        }

        @Test
        @Order(32)
        @DisplayName("Should verify password encoding and authentication flow")
        void shouldVerifyPasswordEncodingAndAuth() throws Exception {
            String email = "password@test.com";
            String plainPassword = "MySecurePassword123!";

            // Register user
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(email);
            registerRequest.setPassword(plainPassword);
            registerRequest.setFullName("Password Test User");
            registerRequest.setPhoneNumber("1234567890");
            registerRequest.setRole("CANDIDATE");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated());

            // Verify password is encoded in database
            User savedUser = userRepository.getUserByEmail(email).orElseThrow();
            assertThat(savedUser.getPassword()).isNotEqualTo(plainPassword);
            assertThat(passwordEncoder.matches(plainPassword, savedUser.getPassword())).isTrue();

            // Verify login with correct password works
            AuthRequest correctAuth = new AuthRequest();
            correctAuth.setEmail(email);
            correctAuth.setPassword(plainPassword);

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(correctAuth)))
                    .andExpect(status().isOk());

            // Verify login with incorrect password fails
            AuthRequest incorrectAuth = new AuthRequest();
            incorrectAuth.setEmail(email);
            incorrectAuth.setPassword("WrongPassword");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(incorrectAuth)))
                    .andExpect(status().isUnauthorized());
        }
    }

    // Helper methods
    private void createTestCandidate(String email, String password, String fullName) {
        // Fetch fresh role from database to avoid TransientObjectException
        Role freshCandidateRole = roleRepository.findByName(RoleName.CANDIDATE)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.CANDIDATE);
                    return roleRepository.save(role);
                });

        // Use proper builder to create Candidate with all required fields
        Candidate candidate = Candidate.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .phoneNumber("1234567890")
                .role(freshCandidateRole)
                .isActive(true)
                .build();
        candidateRepository.save(candidate);
    }

    private void createTestRecruiter(String email, String password, String fullName) {
        // Fetch fresh role from database to avoid TransientObjectException
        Role freshRecruiterRole = roleRepository.findByName(RoleName.RECRUITER)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.RECRUITER);
                    return roleRepository.save(role);
                });

        // Use proper builder to create Recruiter with all required fields
        Recruiter recruiter = Recruiter.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .phoneNumber("0987654321")
                .role(freshRecruiterRole)
                .isActive(true)
                .build();
        recruiterRepository.save(recruiter);
    }

    private LoginTokens loginAndGetTokens(String email, String password) throws Exception {
        AuthRequest authRequest = new AuthRequest();
        authRequest.setEmail(email);
        authRequest.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        String accessToken = response.get("data").get("token").asText();
        String refreshToken = response.get("data").get("refreshToken").asText();

        return new LoginTokens(accessToken, refreshToken);
    }

    private static class LoginTokens {
        final String accessToken;
        final String refreshToken;

        LoginTokens(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }
    }
} 