package com.aprilboiz.jobmatch.unit;

import com.aprilboiz.jobmatch.exception.StorageException;
import com.aprilboiz.jobmatch.storage.StorageProperties;
import com.aprilboiz.jobmatch.storage.impl.FileSystemStorageService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("FileSystemStorageService Unit Tests")
class StorageServiceUnitTests {

    @TempDir
    Path tempDir;

    @Mock
    private StorageProperties storageProperties;

    @Mock
    private MultipartFile mockFile;

    private FileSystemStorageService storageService;

    @BeforeEach
    void setUp() {
        when(storageProperties.getLocation()).thenReturn(tempDir.toString());
        storageService = new FileSystemStorageService(storageProperties);
    }

    @Nested
    @DisplayName("Constructor Tests")
    @Order(1)
    class ConstructorTests {

        @Test
        @Order(10)
        @DisplayName("Should create storage service with valid location")
        void shouldCreateStorageServiceWithValidLocation() {
            // Given
            StorageProperties validProperties = mock(StorageProperties.class);
            when(validProperties.getLocation()).thenReturn(tempDir.toString());

            // When & Then
            assertThatCode(() -> new FileSystemStorageService(validProperties))
                    .doesNotThrowAnyException();
        }

        @Test
        @Order(11)
        @DisplayName("Should throw StorageException for empty location")
        void shouldThrowStorageExceptionForEmptyLocation() {
            // Given
            StorageProperties invalidProperties = mock(StorageProperties.class);
            when(invalidProperties.getLocation()).thenReturn("");

            // When & Then
            assertThatThrownBy(() -> new FileSystemStorageService(invalidProperties))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Storage location is not set");
        }

        @Test
        @Order(12)
        @DisplayName("Should throw StorageException for blank location")
        void shouldThrowStorageExceptionForBlankLocation() {
            // Given
            StorageProperties invalidProperties = mock(StorageProperties.class);
            when(invalidProperties.getLocation()).thenReturn("   ");

            // When & Then
            assertThatThrownBy(() -> new FileSystemStorageService(invalidProperties))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Storage location is not set");
        }

        @Test
        @Order(13)
        @DisplayName("Should create directory if it doesn't exist")
        void shouldCreateDirectoryIfItDoesntExist() {
            // Given
            Path nonExistentDir = tempDir.resolve("new-storage-dir");
            StorageProperties properties = mock(StorageProperties.class);
            when(properties.getLocation()).thenReturn(nonExistentDir.toString());

            // When
            FileSystemStorageService service = new FileSystemStorageService(properties);

            // Then
            assertThat(Files.exists(nonExistentDir)).isTrue();
            assertThat(Files.isDirectory(nonExistentDir)).isTrue();
        }
    }

    @Nested
    @DisplayName("Store Method Tests")
    @Order(2)
    class StoreMethodTests {

        @Test
        @Order(20)
        @DisplayName("Should store file successfully")
        void shouldStoreFileSuccessfully() throws IOException {
            // Given
            String fileName = "test-file.txt";
            String fileContent = "Test file content";
            byte[] contentBytes = fileContent.getBytes();

            when(mockFile.isEmpty()).thenReturn(false);
            when(mockFile.getOriginalFilename()).thenReturn(fileName);
            when(mockFile.getInputStream()).thenReturn(new ByteArrayInputStream(contentBytes));

            // When
            String result = storageService.store(mockFile);

            // Then
            assertThat(result).isNotNull();
            assertThat(result).contains(fileName);

            Path storedFile = tempDir.resolve(fileName);
            assertThat(Files.exists(storedFile)).isTrue();
            assertThat(Files.readString(storedFile)).isEqualTo(fileContent);
        }

        @Test
        @Order(21)
        @DisplayName("Should throw StorageException for empty file")
        void shouldThrowStorageExceptionForEmptyFile() {
            // Given
            when(mockFile.isEmpty()).thenReturn(true);

            // When & Then
            assertThatThrownBy(() -> storageService.store(mockFile))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to store empty file.");
        }

        @Test
        @Order(22)
        @DisplayName("Should throw StorageException for path traversal attempt")
        void shouldThrowStorageExceptionForPathTraversalAttempt() {
            // Given
            when(mockFile.isEmpty()).thenReturn(false);
            when(mockFile.getOriginalFilename()).thenReturn("../malicious-file.txt");

            // When & Then
            assertThatThrownBy(() -> storageService.store(mockFile))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Cannot store file outside current directory.");
        }

        @Test
        @Order(23)
        @DisplayName("Should throw StorageException when IOException occurs")
        void shouldThrowStorageExceptionWhenIOExceptionOccurs() throws IOException {
            // Given
            when(mockFile.isEmpty()).thenReturn(false);
            when(mockFile.getOriginalFilename()).thenReturn("test-file.txt");
            when(mockFile.getInputStream()).thenThrow(new IOException("IO Error"));

            // When & Then
            assertThatThrownBy(() -> storageService.store(mockFile))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to store file.");
        }

        @Test
        @Order(24)
        @DisplayName("Should replace existing file")
        void shouldReplaceExistingFile() throws IOException {
            // Given
            String fileName = "existing-file.txt";
            String newContent = "New file content";
            byte[] newContentBytes = newContent.getBytes();

            // Create existing file
            Path existingFile = tempDir.resolve(fileName);
            Files.writeString(existingFile, "Old content");

            when(mockFile.isEmpty()).thenReturn(false);
            when(mockFile.getOriginalFilename()).thenReturn(fileName);
            when(mockFile.getInputStream()).thenReturn(new ByteArrayInputStream(newContentBytes));

            // When
            String result = storageService.store(mockFile);

            // Then
            assertThat(result).isNotNull();
            assertThat(Files.readString(existingFile)).isEqualTo(newContent);
        }
    }

    @Nested
    @DisplayName("Load Method Tests")
    @Order(3)
    class LoadMethodTests {

        @Test
        @Order(30)
        @DisplayName("Should load file path correctly")
        void shouldLoadFilePathCorrectly() {
            // Given
            String fileName = "test-file.txt";

            // When
            Path result = storageService.load(fileName);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getFileName().toString()).isEqualTo(fileName);
            assertThat(result.getParent()).isEqualTo(tempDir);
        }

        @Test
        @Order(31)
        @DisplayName("Should handle nested path correctly")
        void shouldHandleNestedPathCorrectly() {
            // Given
            String fileName = "subfolder/test-file.txt";

            // When
            Path result = storageService.load(fileName);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.toString()).contains("subfolder");
            assertThat(result.toString()).contains("test-file.txt");
        }
    }

    @Nested
    @DisplayName("LoadAll Method Tests")
    @Order(4)
    class LoadAllMethodTests {

        @Test
        @Order(40)
        @DisplayName("Should load all files in directory")
        void shouldLoadAllFilesInDirectory() throws IOException {
            // Given
            Files.createFile(tempDir.resolve("file1.txt"));
            Files.createFile(tempDir.resolve("file2.txt"));
            Files.createDirectory(tempDir.resolve("subfolder"));

            // When
            List<Path> result = storageService.loadAll();

            // Then
            assertThat(result).hasSize(3);
            assertThat(result.stream().map(Path::toString))
                    .containsExactlyInAnyOrder("file1.txt", "file2.txt", "subfolder");
        }

        @Test
        @Order(41)
        @DisplayName("Should return empty list for empty directory")
        void shouldReturnEmptyListForEmptyDirectory() {
            // When
            List<Path> result = storageService.loadAll();

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Delete Method Tests")
    @Order(5)
    class DeleteMethodTests {

        @Test
        @Order(50)
        @DisplayName("Should delete file successfully")
        void shouldDeleteFileSuccessfully() throws IOException {
            // Given
            String fileName = "file-to-delete.txt";
            Path fileToDelete = tempDir.resolve(fileName);
            Files.createFile(fileToDelete);
            assertThat(Files.exists(fileToDelete)).isTrue();

            // When
            storageService.delete(fileName);

            // Then
            assertThat(Files.exists(fileToDelete)).isFalse();
        }

        @Test
        @Order(51)
        @DisplayName("Should throw StorageException when deleting non-existent file")
        void shouldThrowStorageExceptionWhenDeletingNonExistentFile() {
            // Given
            String nonExistentFile = "non-existent-file.txt";

            // When & Then
            assertThatThrownBy(() -> storageService.delete(nonExistentFile))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to delete file " + nonExistentFile);
        }
    }

    @Nested
    @DisplayName("Replace Method Tests")
    @Order(6)
    class ReplaceMethodTests {

        @Test
        @Order(60)
        @DisplayName("Should replace file successfully")
        void shouldReplaceFileSuccessfully() throws IOException {
            // Given
            String oldFileName = "old-file.txt";
            String newFileName = "new-file.txt";
            String newContent = "New content";

            // Create old file
            Path oldFile = tempDir.resolve(oldFileName);
            Files.writeString(oldFile, "Old content");

            when(mockFile.isEmpty()).thenReturn(false);
            when(mockFile.getOriginalFilename()).thenReturn(newFileName);
            when(mockFile.getInputStream()).thenReturn(new ByteArrayInputStream(newContent.getBytes()));

            // When
            String result = storageService.replace(oldFileName, mockFile);

            // Then
            assertThat(result).isNotNull();
            assertThat(Files.exists(oldFile)).isFalse();
            assertThat(Files.exists(tempDir.resolve(newFileName))).isTrue();
            assertThat(Files.readString(tempDir.resolve(newFileName))).isEqualTo(newContent);
        }

        @Test
        @Order(61)
        @DisplayName("Should throw StorageException when replace fails")
        void shouldThrowStorageExceptionWhenReplaceFails() {
            // Given
            String oldFileName = "non-existent-file.txt";

            // When & Then
            assertThatThrownBy(() -> storageService.replace(oldFileName, mockFile))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Failed to replace file " + oldFileName);
        }
    }

    @Nested
    @DisplayName("LoadAsResource Method Tests")
    @Order(7)
    class LoadAsResourceMethodTests {

        @Test
        @Order(70)
        @DisplayName("Should load existing file as resource")
        void shouldLoadExistingFileAsResource() throws IOException {
            // Given
            String fileName = "resource-file.txt";
            String content = "Resource content";
            Path resourceFile = tempDir.resolve(fileName);
            Files.writeString(resourceFile, content);

            // When
            Resource result = storageService.loadAsResource(fileName);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.exists()).isTrue();
            assertThat(result.isReadable()).isTrue();
            assertThat(result.getFilename()).isEqualTo(fileName);
        }

        @Test
        @Order(71)
        @DisplayName("Should throw StorageException for non-existent file")
        void shouldThrowStorageExceptionForNonExistentFile() {
            // Given
            String nonExistentFile = "non-existent-file.txt";

            // When & Then
            assertThatThrownBy(() -> storageService.loadAsResource(nonExistentFile))
                    .isInstanceOf(StorageException.class)
                    .hasMessage("Could not read file: " + nonExistentFile);
        }

        @Test
        @Order(72)
        @DisplayName("Should throw StorageException for unreadable file")
        void shouldThrowStorageExceptionForUnreadableFile() throws IOException {
            // Given
            String fileName = "unreadable-file.txt";
            Path unreadableFile = tempDir.resolve(fileName);
            Files.createFile(unreadableFile);
            // Make file unreadable (this may not work on all systems)
            unreadableFile.toFile().setReadable(false);

            // When & Then - Skip test if we can't make file unreadable
            if (!unreadableFile.toFile().canRead()) {
                assertThatThrownBy(() -> storageService.loadAsResource(fileName))
                        .isInstanceOf(StorageException.class)
                        .hasMessage("Could not read file: " + fileName);
            } else {
                // If we can't make the file unreadable, just verify the method works
                Resource result = storageService.loadAsResource(fileName);
                assertThat(result).isNotNull();
            }
        }
    }
} 