package com.aprilboiz.jobmatch.model;

import com.aprilboiz.jobmatch.enumerate.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;


@EqualsAndHashCode(callSuper = true)
@Entity
@NoArgsConstructor
@Data
@AllArgsConstructor
@Builder
@SQLRestriction("deleted_at IS NULL")
public class Application extends AuditableEntity{
    @Id
    @GeneratedValue
    private Long id;

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

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;
}
