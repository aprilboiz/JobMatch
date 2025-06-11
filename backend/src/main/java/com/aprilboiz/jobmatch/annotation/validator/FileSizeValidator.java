package com.aprilboiz.jobmatch.annotation.validator;

import com.aprilboiz.jobmatch.annotation.ValidFileSize;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

public class FileSizeValidator implements ConstraintValidator<ValidFileSize, MultipartFile> {
    private Long maxSize;

    @Override
    public void initialize(ValidFileSize constraintAnnotation) {
        this.maxSize = constraintAnnotation.maxSize();
    }

    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        if (file == null || file.isEmpty()) {
            return true;
        }

        return file.getSize() <= maxSize;
    }
}
