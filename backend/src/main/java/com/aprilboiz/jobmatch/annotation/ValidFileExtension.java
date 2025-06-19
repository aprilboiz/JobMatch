package com.aprilboiz.jobmatch.annotation;

import com.aprilboiz.jobmatch.annotation.validator.FileExtensionValidator;
import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FileExtensionValidator.class)
public @interface ValidFileExtension {
    String message() default "{" + ValidationMessages.FILE_EXTENSION_INVALID + "}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String[] extensions() default {};
}

