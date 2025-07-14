package com.aprilboiz.jobmatch.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Analysis {
    @Id
    @GeneratedValue
    private Long id;
    @NotNull
    private Double score;
    private String matchSkills;
    private String missingSkills;

    @CreatedDate
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "analysis")
    private Application application;
}
