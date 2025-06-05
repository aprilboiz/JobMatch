package com.aprilboiz.jobmatch.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@NoArgsConstructor
public class Company extends AuditableEntity{
    @Id
    @GeneratedValue
    private Long id;
    @NotNull
    private String name;

    private String website;
    private String phoneNumber;
    private String email;
    @NotNull
    private String address;
    @NotNull
    private String companySize;
    @NotNull
    private String industry;

    @OneToMany(mappedBy = "company")
    private List<Recruiter> recruiters;

    @OneToMany(mappedBy = "company")
    private List<Job> jobs;
}
