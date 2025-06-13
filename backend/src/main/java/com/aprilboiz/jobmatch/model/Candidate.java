package com.aprilboiz.jobmatch.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;


@EqualsAndHashCode(callSuper = true)
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Candidate extends AuditableEntity{
    @Id
    @GeneratedValue
    private Long id;
    @NotNull
    private String fullName;
    private String phoneNumber;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-candidate")
    @ToString.Exclude
    private User user;

    @OneToMany(mappedBy = "candidate")
    private List<Application> applications;

    @OneToMany(mappedBy = "candidate")
    private List<CV> cvs;
}
