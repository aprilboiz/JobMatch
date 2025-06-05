package com.aprilboiz.jobmatch.repository;

import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;

import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
