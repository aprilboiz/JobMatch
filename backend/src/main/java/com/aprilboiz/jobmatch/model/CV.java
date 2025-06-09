package com.aprilboiz.jobmatch.model;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@NoArgsConstructor
public class CV extends AuditableEntity{
    @Id
    @GeneratedValue
    private Long id;
    @Lob
    private String content;
    private String filePath;


    @OneToMany(mappedBy = "cv")
    private List<Application> applications;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;
}
