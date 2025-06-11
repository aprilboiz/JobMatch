package com.aprilboiz.jobmatch.storage;

import java.nio.file.Path;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file);
    void delete(String fileName);
    Path load(String fileName);
    List<Path> loadAll();
    String replace(String oldFileName, MultipartFile newFile);
    Resource loadAsResource(String fileName);
}
