package com.aprilboiz.jobmatch.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@SQLRestriction("deleted_at IS NULL")
public class CV extends AuditableEntity {
    @Id
    @GeneratedValue
    private Long id;
    private String filePath;
    private String fileType;
    private String fileName;
    private String fileSize;

    @OneToMany(mappedBy = "cv")
    private List<Application> applications;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;
}
