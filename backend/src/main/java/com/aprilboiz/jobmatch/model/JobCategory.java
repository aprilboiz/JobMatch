package com.aprilboiz.jobmatch.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "job_categories")
public class JobCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @NotNull
    @Column(unique = true, length = 100)
    private String name;
    
    @NotNull
    @Column(length = 255)
    private String description;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
} 