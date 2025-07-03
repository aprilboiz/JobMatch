package com.aprilboiz.jobmatch.repository;

import com.aprilboiz.jobmatch.model.User;

import java.util.Optional;


public interface UserRepository extends SoftDeleteRepository<User, Long> {
    Optional<User> getUserByEmail(String email);
}
