package com.aprilboiz.jobmatch.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("CANDIDATE")
public class Candidate extends User {
    
    @OneToMany(mappedBy = "candidate")
    private List<Application> applications;

    @OneToMany(mappedBy = "candidate")
    private List<CV> cvs;
    
    @Builder
    public Candidate(Long id, String email, String password, String fullName, String phoneNumber, Boolean isActive, Role role, 
                    List<Application> applications, List<CV> cvs) {
        super(id, email, password, fullName, phoneNumber, isActive, role);
        this.applications = applications;
        this.cvs = cvs;
    }
}
