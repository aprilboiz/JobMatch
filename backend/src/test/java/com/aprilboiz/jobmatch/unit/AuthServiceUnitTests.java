package com.aprilboiz.jobmatch.unit;

import com.aprilboiz.jobmatch.dto.request.AuthRequest;
import com.aprilboiz.jobmatch.dto.request.LogoutRequest;
import com.aprilboiz.jobmatch.dto.request.RefreshTokenRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.dto.response.AuthResponse;
import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.exception.AuthException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.service.JwtService;
import com.aprilboiz.jobmatch.service.TokenBlacklistService;
import com.aprilboiz.jobmatch.service.UserService;
import com.aprilboiz.jobmatch.service.impl.AuthServiceImpl;
import com.aprilboiz.jobmatch.service.impl.JwtServiceImpl;
import com.aprilboiz.jobmatch.service.impl.TokenBlacklistServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Duration;
import java.util.Date;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Comprehensive Authentication Services Unit Tests")
class AuthServiceUnitTests {

    // ================== AUTH SERVICE TESTS ==================
    @Nested
    @DisplayName("AuthService Unit Tests")
    @Order(1)
    class AuthServiceTests {

        @Mock
        private JwtService jwtService;

        @Mock
        private AuthenticationManager authManager;

        @Mock
        private UserService userService;

        @Mock
        private TokenBlacklistService tokenBlacklistService;

        @Mock
        private ApplicationMapper appMapper;

        @Mock
        private Authentication authentication;

        @InjectMocks
        private AuthServiceImpl authService;

        private AuthRequest authRequest;
        private RegisterRequest registerRequest;
        private User user;
        private UserPrincipal userPrincipal;
        private Role role;

        @BeforeEach
        void setUp() {
            authRequest = new AuthRequest();
            authRequest.setEmail("test@example.com");
            authRequest.setPassword("password123");

            registerRequest = new RegisterRequest();
            registerRequest.setEmail("newuser@example.com");
            registerRequest.setPassword("password123");
            registerRequest.setFullName("John Doe");
            registerRequest.setPhoneNumber("1234567890");
            registerRequest.setRole("CANDIDATE");

            role = new Role();
            role.setId(1L);
            role.setName(RoleName.CANDIDATE);

            user = User.builder()
                    .id(1L)
                    .email("test@example.com")
                    .password("encoded-password")
                    .role(role)
                    .isActive(true)
                    .build();

            userPrincipal = new UserPrincipal(user);
        }

        @Test
        @DisplayName("Should successfully authenticate and return AuthResponse")
        void shouldLoginSuccessfully() {
            // Given
            when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(userPrincipal);
            when(jwtService.generateAccessToken(userPrincipal)).thenReturn("access-token");
            when(jwtService.generateRefreshToken(userPrincipal)).thenReturn("refresh-token");
            when(jwtService.getExpirationTime()).thenReturn(3600L);

            // When
            AuthResponse response = authService.login(authRequest);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
            assertThat(response.getExpiresIn()).isEqualTo(3600L);

            verify(authManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtService, times(1)).generateAccessToken(userPrincipal);
            verify(jwtService, times(1)).generateRefreshToken(userPrincipal);
        }

        @Test
        @DisplayName("Should throw BadCredentialsException when authentication fails")
        void shouldThrowBadCredentialsExceptionWhenAuthenticationFails() {
            // Given
            when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new AuthenticationException("Invalid credentials") {});

            // When & Then
            assertThatThrownBy(() -> authService.login(authRequest))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Invalid email or password.");

            verify(authManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtService, never()).generateAccessToken(any());
            verify(jwtService, never()).generateRefreshToken(any());
        }

        @Test
        @DisplayName("Should successfully refresh tokens")
        void shouldRefreshTokensSuccessfully() {
            // Given
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("valid-refresh-token");

            when(jwtService.validateToken("valid-refresh-token")).thenReturn(true);
            when(jwtService.extractUsername("valid-refresh-token")).thenReturn("test@example.com");
            when(userService.loadUserByUsername("test@example.com")).thenReturn(userPrincipal);
            when(jwtService.validateRefreshToken("valid-refresh-token", userPrincipal)).thenReturn(true);
            when(jwtService.generateAccessToken(userPrincipal)).thenReturn("new-access-token");
            when(jwtService.generateRefreshToken(userPrincipal)).thenReturn("new-refresh-token");
            when(jwtService.getRefreshTokenExpirationTime()).thenReturn(7200L);
            when(jwtService.getExpirationTime()).thenReturn(3600L);

            // When
            AuthResponse response = authService.refreshToken(request);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("new-access-token");
            assertThat(response.getRefreshToken()).isEqualTo("new-refresh-token");

            verify(tokenBlacklistService).blacklistToken(eq("valid-refresh-token"), any(Duration.class));
        }

        @Test
        @DisplayName("Should successfully logout and blacklist tokens")
        void shouldLogoutSuccessfully() {
            // Given
            LogoutRequest request = new LogoutRequest();
            request.setAccessToken("access-token");
            request.setRefreshToken("refresh-token");

            when(jwtService.getExpirationTime()).thenReturn(3600L);
            when(jwtService.getRefreshTokenExpirationTime()).thenReturn(7200L);

            // When
            authService.logout(request);

            // Then
            verify(tokenBlacklistService).blacklistToken(eq("access-token"), any(Duration.class));
            verify(tokenBlacklistService).blacklistToken(eq("refresh-token"), any(Duration.class));
        }

        @Test
        @DisplayName("Should register user successfully")
        void shouldRegisterUserSuccessfully() {
            // When
            authService.register(registerRequest);

            // Then
            verify(userService, times(1)).createUser(registerRequest);
        }
    }

    // ================== JWT SERVICE TESTS ==================
    @Nested
    @DisplayName("JwtService Unit Tests")
    @Order(2)
    class JwtServiceTests {

        private JwtServiceImpl jwtService;
        private UserDetails userDetails;

        @BeforeEach
        void setUp() {
            jwtService = new JwtServiceImpl();
            
            // Initialize required fields using reflection
            ReflectionTestUtils.setField(jwtService, "secretKey", 
                "7e28991c10c1f5294a74dbcab40b23d77a291c612692b97eb8f8c3d67c6d0e0507059122d8cb52b9ca009b214b83977cf4d4d7472d924c745102f1e18497df05");
            ReflectionTestUtils.setField(jwtService, "accessTokenExpiration", 3600L);
            ReflectionTestUtils.setField(jwtService, "refreshTokenExpiration", 7200L);
            
            Role role = new Role();
            role.setName(RoleName.CANDIDATE);
            
            User user = User.builder()
                    .email("test@example.com")
                    .password("encoded-password")
                    .role(role)
                    .isActive(true)
                    .build();
            
            userDetails = new UserPrincipal(user);
        }

        @Test
        @DisplayName("Should generate valid access token")
        void shouldGenerateValidAccessToken() {
            // When
            String token = jwtService.generateAccessToken(userDetails);

            // Then
            assertThat(token).isNotNull();
            assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
            assertThat(jwtService.validateToken(token)).isTrue();
            assertThat(jwtService.extractUsername(token)).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("Should generate valid refresh token with JTI")
        void shouldGenerateValidRefreshToken() {
            // When
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // Then
            assertThat(refreshToken).isNotNull();
            assertThat(refreshToken.split("\\.")).hasSize(3);
            assertThat(jwtService.validateToken(refreshToken)).isTrue();
            assertThat(jwtService.extractJti(refreshToken)).isNotNull();
        }

        @Test
        @DisplayName("Should validate token expiration correctly")
        void shouldValidateTokenExpirationCorrectly() {
            // Given
            String token = jwtService.generateAccessToken(userDetails);

            // When & Then
            assertThat(jwtService.isTokenExpired(token)).isFalse();
            
            Date expiration = jwtService.extractExpiration(token);
            assertThat(expiration).isAfter(new Date());
        }

        @Test
        @DisplayName("Should throw AuthException for invalid token")
        void shouldThrowAuthExceptionForInvalidToken() {
            // When & Then
            assertThatThrownBy(() -> jwtService.validateToken("invalid.token.here"))
                    .isInstanceOf(AuthException.class);
        }

        @Test
        @DisplayName("Should validate refresh token correctly")
        void shouldValidateRefreshTokenCorrectly() {
            // Given
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // When
            boolean isValid = jwtService.validateRefreshToken(refreshToken, userDetails);

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should return correct expiration times")
        void shouldReturnCorrectExpirationTimes() {
            // When & Then
            assertThat(jwtService.getExpirationTime()).isEqualTo(3600L); // 1 hour
            assertThat(jwtService.getRefreshTokenExpirationTime()).isEqualTo(7200L); // 2 hours
        }
    }

    // ================== TOKEN BLACKLIST SERVICE TESTS ==================
    @Nested
    @DisplayName("TokenBlacklistService Unit Tests")
    @Order(3)
    class TokenBlacklistServiceTests {

        @Mock
        private RedisTemplate<String, Object> redisTemplate;

        @Mock
        private ValueOperations<String, Object> valueOperations;

        @InjectMocks
        private TokenBlacklistServiceImpl tokenBlacklistService;

        @BeforeEach
        void setUp() {
            lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        }

        @Test
        @DisplayName("Should blacklist token successfully")
        void shouldBlacklistTokenSuccessfully() {
            // Given
            String token = "test-token";
            Duration ttl = Duration.ofMinutes(30);

            // When
            tokenBlacklistService.blacklistToken(token, ttl);

            // Then
            verify(valueOperations).set("blacklisted_token:test-token", "blacklisted", ttl);
        }

        @Test
        @DisplayName("Should check if token is blacklisted")
        void shouldCheckIfTokenIsBlacklisted() {
            // Given
            String token = "test-token";
            when(redisTemplate.hasKey("blacklisted_token:test-token")).thenReturn(true);

            // When
            boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(token);

            // Then
            assertThat(isBlacklisted).isTrue();
            verify(redisTemplate).hasKey("blacklisted_token:test-token");
        }

        @Test
        @DisplayName("Should remove token from blacklist")
        void shouldRemoveTokenFromBlacklist() {
            // Given
            String token = "test-token";

            // When
            tokenBlacklistService.removeTokenFromBlacklist(token);

            // Then
            verify(redisTemplate).delete("blacklisted_token:test-token");
        }

        @Test
        @DisplayName("Should clear all blacklisted tokens")
        void shouldClearAllBlacklistedTokens() {
            // Given
            Set<String> keys = Set.of(
                "blacklisted_token:token1",
                "blacklisted_token:token2",
                "blacklisted_token:token3"
            );
            when(redisTemplate.keys("blacklisted_token:*")).thenReturn(keys);

            // When
            tokenBlacklistService.clearAllBlacklistedTokens();

            // Then
            verify(redisTemplate).keys("blacklisted_token:*");
            verify(redisTemplate).delete(keys);
        }

        @Test
        @DisplayName("Should handle Redis failure gracefully and return true for safety")
        void shouldHandleRedisFailureGracefully() {
            // Given
            String token = "test-token";
            when(redisTemplate.hasKey(anyString())).thenThrow(new RuntimeException("Redis error"));

            // When
            boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(token);

            // Then
            assertThat(isBlacklisted).isTrue(); // Should return true for safety
        }

        @Test
        @DisplayName("Should handle empty keys set when clearing")
        void shouldHandleEmptyKeysSetWhenClearing() {
            // Given
            when(redisTemplate.keys("blacklisted_token:*")).thenReturn(Set.of());

            // When
            tokenBlacklistService.clearAllBlacklistedTokens();

            // Then
            verify(redisTemplate).keys("blacklisted_token:*");
            verify(redisTemplate, never()).delete(any(Set.class));
        }

        @Test
        @DisplayName("Should handle null keys when clearing")
        void shouldHandleNullKeysWhenClearing() {
            // Given
            when(redisTemplate.keys("blacklisted_token:*")).thenReturn(null);

            // When
            tokenBlacklistService.clearAllBlacklistedTokens();

            // Then
            verify(redisTemplate).keys("blacklisted_token:*");
            verify(redisTemplate, never()).delete(any(Set.class));
        }
    }
} 