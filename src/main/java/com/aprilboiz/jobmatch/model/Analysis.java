package com.aprilboiz.jobmatch.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;


@Entity
@NoArgsConstructor
public class Analysis {
    @Id
    @GeneratedValue
    private Long id;
    @NotNull
    private Float score;
    private String matchSkills;
    private String missingSkills;

    @CreatedDate
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "analysis")
    private Application application;
}
