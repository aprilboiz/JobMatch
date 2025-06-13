package com.aprilboiz.jobmatch.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
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
    private String jobType;
    @NotNull
    private Double salary;
    @NotNull
    private Integer numberOfOpenings;
    @NotNull
    private LocalDate applicationDeadline;

    @Builder.Default
    private Boolean isActive = Boolean.TRUE;
    
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
}
