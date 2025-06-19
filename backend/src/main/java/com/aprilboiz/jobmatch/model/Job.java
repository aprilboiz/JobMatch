package com.aprilboiz.jobmatch.model;

import com.aprilboiz.jobmatch.enumerate.CurrencyType;
import com.aprilboiz.jobmatch.enumerate.JobStatus;
import com.aprilboiz.jobmatch.enumerate.JobType;
import com.aprilboiz.jobmatch.enumerate.PeriodType;
import com.aprilboiz.jobmatch.enumerate.SalaryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "jobs")
public class Job extends AuditableEntity{
    @Id
    @GeneratedValue
    private Long id;
    @NotNull
    private String title;
    @NotNull
    @Enumerated(EnumType.STRING)
    private JobType jobType;
    @NotNull
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private SalaryType salaryType = SalaryType.FIXED;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private CurrencyType currency = CurrencyType.USD;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private PeriodType salaryPeriod = PeriodType.ANNUAL;
    @NotNull
    private Integer numberOfOpenings;
    @NotNull
    private LocalDate applicationDeadline;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.OPEN;
    
    @Lob
    private String description;

    private String location;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @OneToMany(mappedBy = "job")
    private List<Application> applications;

    @ManyToOne
    @JoinColumn(name = "recruiter_id")
    private Recruiter recruiter;
    
    /**
     * Get formatted salary string for display
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
