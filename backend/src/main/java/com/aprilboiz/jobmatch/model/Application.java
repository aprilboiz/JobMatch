package com.aprilboiz.jobmatch.model;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;


@Entity
@NoArgsConstructor
public class Application {
    @Id
    @GeneratedValue
    private Long id;

    @CreatedDate
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "cv_id")
    private CV cv;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;

    @OneToOne
    @JoinColumn(name = "analysis_id")
    private Analysis analysis;

}
