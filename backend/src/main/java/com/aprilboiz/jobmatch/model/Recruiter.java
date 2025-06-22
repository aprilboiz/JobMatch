package com.aprilboiz.jobmatch.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("RECRUITER")
public class Recruiter extends User {

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @OneToMany(mappedBy = "recruiter")
    private List<Job> jobs;
    
    @Builder
    public Recruiter(Long id, String email, String password, String fullName, String phoneNumber, String avatarUrl,
                    Boolean isActive, Role role, Company company, List<Job> jobs) {
        super(id, email, password, fullName, phoneNumber, avatarUrl, isActive, role);
        this.company = company;
        this.jobs = jobs;
    }
}
