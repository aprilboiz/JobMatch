package com.aprilboiz.jobmatch.annotation.validator;

import com.aprilboiz.jobmatch.annotation.ValidFileExtension;
import jakarta.validation.ConstraintValidator;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

public class FileExtensionValidator implements ConstraintValidator<ValidFileExtension, MultipartFile> {
    private List<String> extensions;

    @Override
    public void initialize(ValidFileExtension constraintAnnotation) {
        extensions = List.of(constraintAnnotation.extensions());
    }

    @Override
    public boolean isValid(MultipartFile file, jakarta.validation.ConstraintValidatorContext context) {
        if (file == null || file.isEmpty()) {
            return true;
        }

        String extension = Objects.requireNonNull(file.getOriginalFilename()).substring(file.getOriginalFilename().lastIndexOf(".") + 1);
        return StringUtils.isNotBlank(extension) && extensions.contains(extension.toLowerCase());
    }
}
