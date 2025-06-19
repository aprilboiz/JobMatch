package com.aprilboiz.jobmatch.annotation;

import com.aprilboiz.jobmatch.annotation.validator.FileContentTypeValidator;
import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(value = RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FileContentTypeValidator.class)
public @interface ValidContentType {
    String message() default "{" + ValidationMessages.FILE_CONTENT_TYPE_INVALID + "}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String[] types() default {};
}
