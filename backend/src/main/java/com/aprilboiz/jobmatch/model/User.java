package com.aprilboiz.jobmatch.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;


@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User extends AuditableEntity  {
    @Id
    @GeneratedValue
    private Long id;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    
    @Builder.Default
    private Boolean isActive = Boolean.TRUE;

    @OneToOne(mappedBy = "user")
    @JsonManagedReference("user-candidate")
    @ToString.Exclude
    private Candidate candidate;
    
    @OneToOne(mappedBy = "user")
    @JsonManagedReference("user-recruiter")
    @ToString.Exclude
    private Recruiter recruiter;
    
    @ManyToOne
    @JoinColumn(name = "role_id")
    @ToString.Exclude
    private Role role;
}
