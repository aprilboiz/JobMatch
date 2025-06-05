package com.aprilboiz.jobmatch.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Recruiter extends AuditableEntity{
    @Id
    @GeneratedValue
    private Long id;
    @NotNull
    private String fullName;
    private String phoneNumber;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-recruiter")
    @ToString.Exclude
    private User user;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @OneToMany(mappedBy = "recruiter")
    private List<Job> jobs;
}
