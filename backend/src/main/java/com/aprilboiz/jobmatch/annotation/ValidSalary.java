package com.aprilboiz.jobmatch.annotation;

import com.aprilboiz.jobmatch.annotation.validator.SalaryValidator;
import com.aprilboiz.jobmatch.dto.validation.ValidationMessages;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom validation annotation to ensure salary data consistency based on salary type.
 * 
 * Rules:
 * - FIXED: minSalary required, maxSalary optional (if provided, must equal minSalary)
 * - RANGE: both minSalary and maxSalary required, maxSalary >= minSalary
 * - NEGOTIABLE/COMPETITIVE: both minSalary and maxSalary must be null
 */
@Target({ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SalaryValidator.class)
@Documented
public @interface ValidSalary {
    String message() default "{" + ValidationMessages.SALARY_INVALID + "}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
} 