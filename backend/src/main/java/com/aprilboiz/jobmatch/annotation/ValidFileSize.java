package com.aprilboiz.jobmatch.annotation;

import com.aprilboiz.jobmatch.annotation.validator.FileSizeValidator;
import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FileSizeValidator.class)
public @interface ValidFileSize {
    String message() default "{" + ValidationMessages.FILE_SIZE_EXCEEDED + "}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    long maxSize() default 1048576L; // 1MB default
}

