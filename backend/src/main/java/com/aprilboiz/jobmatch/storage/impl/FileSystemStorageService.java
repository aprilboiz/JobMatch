package com.aprilboiz.jobmatch.storage.impl;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aprilboiz.jobmatch.exception.StorageException;
import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.storage.StorageProperties;
import com.aprilboiz.jobmatch.storage.StorageService;

@Service
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;
    private final MessageService messageService;

    public FileSystemStorageService(StorageProperties properties, MessageService messageService) {
        if (properties.getLocation().trim().isEmpty()) {
            throw new StorageException(messageService.getMessage("storage.location.not.set"));
        }
        this.rootLocation = Paths.get(properties.getLocation());
        this.messageService = messageService;
        // create the directory if it doesn't exist
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new StorageException(messageService.getMessage("storage.failed.create.directory"), e);
        }
    }

    @Override
    public void delete(String fileName) {
        try {
            Files.delete(rootLocation.resolve(fileName));
        } catch (IOException e) {
            throw new StorageException(messageService.getMessage("storage.failed.delete.file", fileName), e);
        }
    }

    @Override
    public Path load(String fileName) {
        return rootLocation.resolve(fileName);
    }

    @Override
    public List<Path> loadAll() {
        try {
            return Files.walk(rootLocation, 1)
                    .filter(path -> !path.equals(rootLocation))
                    .map(rootLocation::relativize)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new StorageException(messageService.getMessage("storage.failed.read.files"), e);
        }
    }

    @Override
    public String replace(String oldFileName, MultipartFile newFile) {
        try {
            delete(oldFileName);
            return store(newFile);
        } catch (Exception e) {
            throw new StorageException(messageService.getMessage("storage.failed.replace.file", oldFileName), e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        try {
			if (file.isEmpty()) {
				throw new StorageException(messageService.getMessage("storage.failed.store.empty"));
			}
			Path destinationFile = this.rootLocation.resolve(
					Paths.get(file.getOriginalFilename()))
					.normalize().toAbsolutePath();
			if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
				// This is a security check
				throw new StorageException(messageService.getMessage("storage.failed.store.outside.directory"));
			}
			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, destinationFile,
					StandardCopyOption.REPLACE_EXISTING);
			}
            return destinationFile.toString();
		}
		catch (IOException e) {
			throw new StorageException(messageService.getMessage("storage.failed.store.file"), e);
		}
    }

    @Override
    public Resource loadAsResource(String fileName) {
        try {
            Path file = load(fileName);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }
            else {
                throw new StorageException(messageService.getMessage("storage.file.not.readable", fileName));
            }
        } catch (MalformedURLException e) {
            throw new StorageException(messageService.getMessage("storage.file.not.readable", fileName), e);
        }
    }
}
