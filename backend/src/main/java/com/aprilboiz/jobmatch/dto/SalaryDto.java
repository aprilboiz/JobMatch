package com.aprilboiz.jobmatch.dto;

import java.math.BigDecimal;

import com.aprilboiz.jobmatch.annotation.ValidSalary;
import com.aprilboiz.jobmatch.enumerate.CurrencyType;
import com.aprilboiz.jobmatch.enumerate.PeriodType;
import com.aprilboiz.jobmatch.enumerate.SalaryType;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Salary information for job postings")
@ValidSalary
public class SalaryDto {
    
    @NotNull(message = "Salary type is required")
    @Schema(description = "Type of salary structure", example = "RANGE", 
            allowableValues = {"FIXED", "RANGE", "NEGOTIABLE", "COMPETITIVE"})
    private SalaryType salaryType;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Minimum salary must be positive")
    @Schema(description = "Minimum salary amount (required for FIXED and RANGE types)", 
            example = "50000.00")
    private BigDecimal minSalary;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Maximum salary must be positive")
    @Schema(description = "Maximum salary amount (required for RANGE type, equals minSalary for FIXED)", 
            example = "80000.00")
    private BigDecimal maxSalary;
    
    @Builder.Default
    @Schema(description = "Currency code", example = "USD")
    private CurrencyType currency = CurrencyType.USD;
    
    @Builder.Default
    @Schema(description = "Salary payment period", example = "ANNUAL", 
            allowableValues = {"ANNUAL", "MONTHLY", "WEEKLY", "HOURLY"})
    private PeriodType salaryPeriod = PeriodType.ANNUAL;
    
    /**
     * Validates that salary values are consistent with the salary type
     */
    public boolean isValid() {
        return switch (salaryType) {
            case FIXED -> minSalary != null && (maxSalary == null || maxSalary.equals(minSalary));
            case RANGE -> minSalary != null && maxSalary != null && maxSalary.compareTo(minSalary) >= 0;
            case NEGOTIABLE, COMPETITIVE -> minSalary == null && maxSalary == null;
        };
    }
    
    /**
     * Gets formatted salary string for display
     */
    public String getFormattedSalary() {
        return switch (salaryType) {
            case FIXED -> formatAmount(minSalary);
            case RANGE -> formatAmount(minSalary) + " - " + formatAmount(maxSalary);
            case NEGOTIABLE -> "Negotiable";
            case COMPETITIVE -> "Competitive";
        };
    }
    
    private String formatAmount(BigDecimal amount) {
        if (amount == null) return "N/A";
        return String.format("%,.0f %s %s", amount, currency, salaryPeriod.name().toLowerCase());
    }
} 