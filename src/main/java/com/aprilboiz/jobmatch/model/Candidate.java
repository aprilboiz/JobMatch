package com.aprilboiz.jobmatch.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Date;
import java.util.List;


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
}
