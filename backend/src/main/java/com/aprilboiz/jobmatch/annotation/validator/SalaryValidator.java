package com.aprilboiz.jobmatch.annotation.validator;

import com.aprilboiz.jobmatch.annotation.ValidSalary;
import com.aprilboiz.jobmatch.dto.SalaryDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class SalaryValidator implements ConstraintValidator<ValidSalary, SalaryDto> {

    @Override
    public void initialize(ValidSalary constraintAnnotation) {
    }

    @Override
    public boolean isValid(SalaryDto salary, ConstraintValidatorContext context) {
        if (salary == null || salary.getSalaryType() == null) {
            return false;
        }

        return switch (salary.getSalaryType()) {
            case FIXED -> validateFixedSalary(salary, context);
            case RANGE -> validateRangeSalary(salary, context);
            case NEGOTIABLE, COMPETITIVE -> validateNegotiableSalary(salary, context);
        };
    }

    private boolean validateFixedSalary(SalaryDto salary, ConstraintValidatorContext context) {
        if (salary.getMinSalary() == null) {
            addConstraintViolation(context, "Fixed salary requires minimum salary amount");
            return false;
        }
        
        if (salary.getMaxSalary() != null && !salary.getMaxSalary().equals(salary.getMinSalary())) {
            addConstraintViolation(context, "For fixed salary, maximum salary should equal minimum salary or be null");
            return false;
        }
        
        return true;
    }

    private boolean validateRangeSalary(SalaryDto salary, ConstraintValidatorContext context) {
        if (salary.getMinSalary() == null) {
            addConstraintViolation(context, "Salary range requires minimum salary amount");
            return false;
        }
        
        if (salary.getMaxSalary() == null) {
            addConstraintViolation(context, "Salary range requires maximum salary amount");
            return false;
        }
        
        if (salary.getMaxSalary().compareTo(salary.getMinSalary()) < 0) {
            addConstraintViolation(context, "Maximum salary must be greater than or equal to minimum salary");
            return false;
        }
        
        return true;
    }

    private boolean validateNegotiableSalary(SalaryDto salary, ConstraintValidatorContext context) {
        if (salary.getMinSalary() != null || salary.getMaxSalary() != null) {
            addConstraintViolation(context, "Negotiable and competitive salaries should not specify amounts");
            return false;
        }
        
        return true;
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
} 