package com.aprilboiz.jobmatch.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@EqualsAndHashCode(callSuper = true)
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
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
    private String description;
    private String logoUrl;

    @OneToMany(mappedBy = "company")
    private List<Recruiter> recruiters;

    @OneToMany(mappedBy = "company")
    private List<Job> jobs;
}
