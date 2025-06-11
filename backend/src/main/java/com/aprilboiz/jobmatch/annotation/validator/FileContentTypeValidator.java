package com.aprilboiz.jobmatch.annotation.validator;

import com.aprilboiz.jobmatch.annotation.ValidContentType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class FileContentTypeValidator implements ConstraintValidator<ValidContentType, MultipartFile> {
    private List<String> allowedTypes;

    @Override
    public void initialize(ValidContentType constraintAnnotation) {
        this.allowedTypes = List.of(constraintAnnotation.types());
    }

    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        if (file == null || file.isEmpty()) {
            return true;
        }

        String contentType = file.getContentType();
        return contentType != null && allowedTypes.contains(contentType);
    }
}
