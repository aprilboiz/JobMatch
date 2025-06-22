package com.aprilboiz.jobmatch.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.exception.DuplicateException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.repository.CandidateRepository;
import com.aprilboiz.jobmatch.repository.CompanyRepository;
import com.aprilboiz.jobmatch.repository.RecruiterRepository;
import com.aprilboiz.jobmatch.repository.RoleRepository;
import com.aprilboiz.jobmatch.repository.UserRepository;
import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.service.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Email Validation Tests")
class UserServiceUnitTests {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private CandidateRepository candidateRepository;
    
    @Mock
    private RecruiterRepository recruiterRepository;
    
    @Mock
    private RoleRepository roleRepository;
    
    @Mock
    private CompanyRepository companyRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private ApplicationMapper userMapper;
    
    @Mock
    private MessageService messageService;
    
    @InjectMocks
    private UserServiceImpl userService;
    
    private Role candidateRole;
    private Role recruiterRole;
    
    @BeforeEach
    void setUp() {
        candidateRole = new Role();
        candidateRole.setName(RoleName.CANDIDATE);
        
        recruiterRole = new Role();
        recruiterRole.setName(RoleName.RECRUITER);
        
        // Setup common mocks
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(messageService.getMessage("validation.required.email")).thenReturn("Email is required");
        when(messageService.getMessage("error.user.duplicate")).thenReturn("User already exists");
    }
    
    @Test
    @DisplayName("Should successfully create candidate with valid email")
    void shouldCreateCandidateWithValidEmail() {
        // Arrange
        String testEmail = "test@example.com";
        RegisterRequest request = createValidRegisterRequest(testEmail, "CANDIDATE");
        
        when(userRepository.getUserByEmail(testEmail)).thenReturn(Optional.empty());
        when(roleRepository.findByName(RoleName.CANDIDATE)).thenReturn(Optional.of(candidateRole));
        
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        
        // Act
        assertDoesNotThrow(() -> userService.createUser(request));
        
        // Assert
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        
        assertNotNull(savedUser);
        assertEquals(testEmail, savedUser.getEmail());
        assertInstanceOf(Candidate.class, savedUser);
        assertEquals("Test User", savedUser.getFullName());
        assertEquals("1234567890", savedUser.getPhoneNumber());
        assertTrue(savedUser.getIsActive());
    }
    
    @Test
    @DisplayName("Should successfully create recruiter with valid email")
    void shouldCreateRecruiterWithValidEmail() {
        // Arrange
        String testEmail = "recruiter@example.com";
        RegisterRequest request = createValidRegisterRequest(testEmail, "RECRUITER");
        
        when(userRepository.getUserByEmail(testEmail)).thenReturn(Optional.empty());
        when(roleRepository.findByName(RoleName.RECRUITER)).thenReturn(Optional.of(recruiterRole));
        
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        
        // Act
        assertDoesNotThrow(() -> userService.createUser(request));
        
        // Assert
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        
        assertNotNull(savedUser);
        assertEquals(testEmail, savedUser.getEmail());
        assertInstanceOf(Recruiter.class, savedUser);
        assertEquals("Test User", savedUser.getFullName());
        assertEquals("1234567890", savedUser.getPhoneNumber());
        assertTrue(savedUser.getIsActive());
    }
    
    @Test
    @DisplayName("Should throw exception when email is null")
    void shouldThrowExceptionWhenEmailIsNull() {
        // Arrange
        RegisterRequest request = createValidRegisterRequest(null, "CANDIDATE");
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.createUser(request)
        );
        
        assertEquals("Email is required", exception.getMessage());
        verify(userRepository, never()).save(any());
    }
    
    @Test
    @DisplayName("Should throw exception when email is empty")
    void shouldThrowExceptionWhenEmailIsEmpty() {
        // Arrange
        RegisterRequest request = createValidRegisterRequest("", "CANDIDATE");
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.createUser(request)
        );
        
        assertEquals("Email is required", exception.getMessage());
        verify(userRepository, never()).save(any());
    }
    
    @Test
    @DisplayName("Should throw exception when email is only whitespace")
    void shouldThrowExceptionWhenEmailIsWhitespace() {
        // Arrange
        RegisterRequest request = createValidRegisterRequest("   ", "CANDIDATE");
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.createUser(request)
        );
        
        assertEquals("Email is required", exception.getMessage());
        verify(userRepository, never()).save(any());
    }
    
    @Test
    @DisplayName("Should throw exception when user already exists")
    void shouldThrowExceptionWhenUserAlreadyExists() {
        // Arrange
        String testEmail = "existing@example.com";
        RegisterRequest request = createValidRegisterRequest(testEmail, "CANDIDATE");
        
        User existingUser = new Candidate();
        when(userRepository.getUserByEmail(testEmail)).thenReturn(Optional.of(existingUser));
        
        // Act & Assert
        DuplicateException exception = assertThrows(
            DuplicateException.class,
            () -> userService.createUser(request)
        );
        
        assertEquals("User already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }
    
    private RegisterRequest createValidRegisterRequest(String email, String role) {
        RegisterRequest request = new RegisterRequest();
        request.setEmail(email);
        request.setPassword("password123");
        request.setFullName("Test User");
        request.setPhoneNumber("1234567890");
        request.setRole(role);
        return request;
    }
} 