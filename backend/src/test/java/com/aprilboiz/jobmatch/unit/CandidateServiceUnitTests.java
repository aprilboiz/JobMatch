package com.aprilboiz.jobmatch.unit;

import com.aprilboiz.jobmatch.dto.response.CvResponse;
import com.aprilboiz.jobmatch.exception.DuplicateException;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.CV;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.repository.CvRepository;
import com.aprilboiz.jobmatch.service.impl.CandidateServiceImpl;
import com.aprilboiz.jobmatch.storage.StorageService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("CandidateService Unit Tests")
class CandidateServiceUnitTests {

    @Mock
    private StorageService storageService;

    @Mock
    private CvRepository cvRepository;

    @Mock
    private ApplicationMapper appMapper;

    @Mock
    private MultipartFile mockFile;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private Resource mockResource;

    @InjectMocks
    private CandidateServiceImpl candidateService;

    private User testUser;
    private Candidate testCandidate;
    private UserPrincipal testUserPrincipal;
    private CV testCv;
    private CvResponse testCvResponse;

    @BeforeEach
    void setUp() {
        // Create test entities
        Role candidateRole = new Role();
        candidateRole.setId(1L);
        candidateRole.setName(RoleName.CANDIDATE);

        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encoded-password")
                .role(candidateRole)
                .isActive(true)
                .build();

        testCandidate = Candidate.builder()
                .id(1L)
                .fullName("Test Candidate")
                .phoneNumber("1234567890")
                .user(testUser)
                .build();

        testUser.setCandidate(testCandidate);
        testUserPrincipal = new UserPrincipal(testUser);

        testCv = new CV();
        testCv.setId(1L);
        testCv.setFileName("test-cv.pdf");
        testCv.setFileType("application/pdf");
        testCv.setFilePath("/path/to/test-cv.pdf");
        testCv.setFileSize("1024");
        testCv.setCandidate(testCandidate);
        testCv.setCreatedAt(LocalDateTime.now());
        testCv.setUpdatedAt(LocalDateTime.now());

        testCvResponse = CvResponse.builder()
                .id(1L)
                .fileName("test-cv.pdf")
                .fileType("application/pdf")
                .fileUri("http://localhost:8080/api/me/cvs/1")
                .updatedAt(testCv.getUpdatedAt().toString())
                .build();
    }

    @Nested
    @DisplayName("CreateCandidateCv Method Tests")
    @Order(1)
    class CreateCandidateCvTests {

        @BeforeEach
        void setUpSecurityContext() {
            SecurityContextHolder.setContext(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUserPrincipal);
        }

        @AfterEach
        void tearDownSecurityContext() {
            SecurityContextHolder.clearContext();
        }

        @Test
        @Order(10)
        @DisplayName("Should create CV successfully")
        void shouldCreateCvSuccessfully() {
            // Given
            String fileName = "new-cv.pdf";
            String contentType = "application/pdf";
            long fileSize = 2048L;
            String filePath = "/storage/new-cv.pdf";

            when(mockFile.getOriginalFilename()).thenReturn(fileName);
            when(mockFile.getContentType()).thenReturn(contentType);
            when(mockFile.getSize()).thenReturn(fileSize);
            when(cvRepository.findByFileNameAndCandidate(fileName, testCandidate))
                    .thenReturn(Optional.empty());
            when(storageService.store(mockFile)).thenReturn(filePath);
            when(cvRepository.save(any(CV.class))).thenReturn(testCv);
            when(appMapper.cvToCvResponse(testCv)).thenReturn(testCvResponse);

            // When
            CvResponse result = candidateService.createCandidateCv(mockFile);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getFileName()).isEqualTo("test-cv.pdf");
            assertThat(result.getFileType()).isEqualTo("application/pdf");

            verify(cvRepository).findByFileNameAndCandidate(fileName, testCandidate);
            verify(storageService).store(mockFile);
            verify(cvRepository).save(any(CV.class));
            verify(appMapper).cvToCvResponse(testCv);
        }

        @Test
        @Order(11)
        @DisplayName("Should throw DuplicateException when CV already exists")
        void shouldThrowDuplicateExceptionWhenCvAlreadyExists() {
            // Given
            String fileName = "existing-cv.pdf";
            when(mockFile.getOriginalFilename()).thenReturn(fileName);
            when(cvRepository.findByFileNameAndCandidate(fileName, testCandidate))
                    .thenReturn(Optional.of(testCv));

            // When & Then
            assertThatThrownBy(() -> candidateService.createCandidateCv(mockFile))
                    .isInstanceOf(DuplicateException.class)
                    .hasMessage("CV already exists");

            verify(cvRepository).findByFileNameAndCandidate(fileName, testCandidate);
            verify(storageService, never()).store(any());
            verify(cvRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("GetAllCandidateCv Method Tests")
    @Order(2)
    class GetAllCandidateCvTests {

        @BeforeEach
        void setUpSecurityContext() {
            SecurityContextHolder.setContext(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUserPrincipal);
        }

        @AfterEach
        void tearDownSecurityContext() {
            SecurityContextHolder.clearContext();
        }

        @Test
        @Order(20)
        @DisplayName("Should return all candidate CVs")
        void shouldReturnAllCandidateCvs() {
            // Given
            CV cv2 = new CV();
            cv2.setId(2L);
            cv2.setFileName("second-cv.pdf");
            cv2.setCandidate(testCandidate);

            CvResponse cvResponse2 = CvResponse.builder()
                    .id(2L)
                    .fileName("second-cv.pdf")
                    .fileType("application/pdf")
                    .fileUri("http://localhost:8080/api/me/cvs/2")
                    .build();

            List<CV> cvList = Arrays.asList(testCv, cv2);
            when(cvRepository.findByCandidate(testCandidate)).thenReturn(cvList);
            when(appMapper.cvToCvResponse(testCv)).thenReturn(testCvResponse);
            when(appMapper.cvToCvResponse(cv2)).thenReturn(cvResponse2);

            // When
            List<CvResponse> result = candidateService.getAllCandidateCv();

            // Then
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            assertThat(result.get(1).getId()).isEqualTo(2L);

            verify(cvRepository).findByCandidate(testCandidate);
            verify(appMapper, times(2)).cvToCvResponse(any(CV.class));
        }

        @Test
        @Order(21)
        @DisplayName("Should return empty list when no CVs found")
        void shouldReturnEmptyListWhenNoCvsFound() {
            // Given
            when(cvRepository.findByCandidate(testCandidate)).thenReturn(Arrays.asList());

            // When
            List<CvResponse> result = candidateService.getAllCandidateCv();

            // Then
            assertThat(result).isEmpty();
            verify(cvRepository).findByCandidate(testCandidate);
            verify(appMapper, never()).cvToCvResponse(any());
        }
    }

    @Nested
    @DisplayName("GetCandidateCv Method Tests")
    @Order(3)
    class GetCandidateCvTests {

        @Test
        @Order(30)
        @DisplayName("Should return CV by ID")
        void shouldReturnCvById() {
            // Given
            Long cvId = 1L;
            when(cvRepository.findById(cvId)).thenReturn(Optional.of(testCv));
            when(appMapper.cvToCvResponse(testCv)).thenReturn(testCvResponse);

            // When
            CvResponse result = candidateService.getCandidateCv(cvId);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(cvId);
            assertThat(result.getFileName()).isEqualTo("test-cv.pdf");

            verify(cvRepository).findById(cvId);
            verify(appMapper).cvToCvResponse(testCv);
        }

        @Test
        @Order(31)
        @DisplayName("Should throw NotFoundException when CV not found")
        void shouldThrowNotFoundExceptionWhenCvNotFound() {
            // Given
            Long nonExistentId = 999L;
            when(cvRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> candidateService.getCandidateCv(nonExistentId))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessage("CV not found");

            verify(cvRepository).findById(nonExistentId);
            verify(appMapper, never()).cvToCvResponse(any());
        }
    }

    @Nested
    @DisplayName("DeleteCandidateCv Method Tests")
    @Order(4)
    class DeleteCandidateCvTests {

        @Test
        @Order(40)
        @DisplayName("Should delete CV successfully")
        void shouldDeleteCvSuccessfully() {
            // Given
            Long cvId = 1L;
            when(cvRepository.findById(cvId)).thenReturn(Optional.of(testCv));

            // When
            candidateService.deleteCandidateCv(cvId);

            // Then
            verify(cvRepository).findById(cvId);
            verify(cvRepository).delete(testCv);
        }

        @Test
        @Order(41)
        @DisplayName("Should throw NotFoundException when trying to delete non-existent CV")
        void shouldThrowNotFoundExceptionWhenTryingToDeleteNonExistentCv() {
            // Given
            Long nonExistentId = 999L;
            when(cvRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> candidateService.deleteCandidateCv(nonExistentId))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessage("CV not found");

            verify(cvRepository).findById(nonExistentId);
            verify(cvRepository, never()).delete(any());
        }
    }

    @Nested
    @DisplayName("DownloadCandidateCv Method Tests")
    @Order(5)
    class DownloadCandidateCvTests {

        @Test
        @Order(50)
        @DisplayName("Should download CV successfully")
        void shouldDownloadCvSuccessfully() {
            // Given
            Long cvId = 1L;
            String filePath = "/path/to/test-cv.pdf";
            when(cvRepository.findById(cvId)).thenReturn(Optional.of(testCv));
            when(storageService.loadAsResource(filePath)).thenReturn(mockResource);

            // When
            Resource result = candidateService.downloadCandidateCv(cvId);

            // Then
            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(mockResource);

            verify(cvRepository).findById(cvId);
            verify(storageService).loadAsResource(filePath);
        }

        @Test
        @Order(51)
        @DisplayName("Should throw NotFoundException when CV not found for download")
        void shouldThrowNotFoundExceptionWhenCvNotFoundForDownload() {
            // Given
            Long nonExistentId = 999L;
            when(cvRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> candidateService.downloadCandidateCv(nonExistentId))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessage("CV not found");

            verify(cvRepository).findById(nonExistentId);
            verify(storageService, never()).loadAsResource(any());
        }
    }

    @Nested
    @DisplayName("GetAllCandidateApplications Method Tests")
    @Order(6)
    class GetAllCandidateApplicationsTests {

        @Test
        @Order(60)
        @DisplayName("Should throw UnsupportedOperationException for unimplemented method")
        void shouldThrowUnsupportedOperationExceptionForUnimplementedMethod() {
            // When & Then
            assertThatThrownBy(() -> candidateService.getAllCandidateApplications())
                    .isInstanceOf(UnsupportedOperationException.class)
                    .hasMessage("Unimplemented method 'getAllCandidateApplications'");
        }
    }
} 