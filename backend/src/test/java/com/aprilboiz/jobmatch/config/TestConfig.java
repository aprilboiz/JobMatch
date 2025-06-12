package com.aprilboiz.jobmatch.config;

import com.aprilboiz.jobmatch.dto.RoleDTO;
import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.dto.response.UserResponse;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.security.JwtAuthenticationFilter;
import com.aprilboiz.jobmatch.service.AuthService;
import com.aprilboiz.jobmatch.service.JwtService;
import com.aprilboiz.jobmatch.service.TokenBlacklistService;
import com.aprilboiz.jobmatch.service.UserService;
import com.aprilboiz.jobmatch.service.impl.InMemoryTokenBlacklistServiceImpl;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.userdetails.UserDetails;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;

@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    @Primary
    public ApplicationMapper userMapper() {
        return new ApplicationMapper() {
            @Override
            public UserResponse userToUserResponse(User user) {
                if (user == null) {
                    return null;
                }
                
                RoleDTO roleDto = null;
                if (user.getRole() != null) {
                    roleDto = RoleDTO.builder()
                            .roleName(user.getRole().getName().toString())
                            .build();
                }
                
                return UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .role(roleDto)
                        .build();
            }

            @Override
            public RoleDTO roleToRoleDTO(Role role) {
                if (role == null) {
                    return null;
                }
                return RoleDTO.builder()
                        .roleName(role.getName().toString())
                        .build();
            }

            @Override
            public CvResponse cvToCvResponse(CV cv) {
                return CvResponse.builder()
                        .id(cv.getId())
                        .fileUri("http://localhost:8080/api/me/cvs/" + cv.getId())
                        .fileName(cv.getFileName())
                        .fileType(cv.getFileType())
                        .updatedAt(cv.getUpdatedAt().toString())
                        .build();
            }
        };
    }

    @Bean
    @Primary
    public TokenBlacklistService tokenBlacklistService() {
        return new InMemoryTokenBlacklistServiceImpl();
    }

    @Bean
    @Primary
    public JwtService jwtService() {
        JwtService mockJwtService = mock(JwtService.class);
        
        // Configure default behavior
        lenient().when(mockJwtService.generateAccessToken(any(UserDetails.class))).thenReturn("mock.jwt.token");
        lenient().when(mockJwtService.generateRefreshToken(any(UserDetails.class))).thenReturn("mock.refresh.token");
        lenient().when(mockJwtService.extractUsername(anyString())).thenReturn("test@example.com");
        lenient().when(mockJwtService.validateToken(anyString())).thenReturn(true);
        lenient().when(mockJwtService.validateRefreshToken(anyString(), any(UserDetails.class))).thenReturn(true);
        lenient().when(mockJwtService.getExpirationTime()).thenReturn(3600L);
        lenient().when(mockJwtService.getRefreshTokenExpirationTime()).thenReturn(7200L);
        
        return mockJwtService;
    }

    @Bean
    @Primary
    public UserService userService() {
        UserService mockUserService = mock(UserService.class);
        
        // Configure default behavior for authentication
        lenient().when(mockUserService.loadUserByUsername(anyString())).thenReturn(
            mock(UserDetails.class)
        );
        
        return mockUserService;
    }

    @Bean
    @Primary
    public AuthService authService() {
        return mock(AuthService.class);
    }

    @Bean
    @Primary
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService, UserService userService) {
        return new JwtAuthenticationFilter(jwtService, userService, tokenBlacklistService());
    }
} 