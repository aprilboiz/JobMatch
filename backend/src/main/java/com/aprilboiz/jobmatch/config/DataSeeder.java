package com.aprilboiz.jobmatch.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.repository.RoleRepository;
import com.aprilboiz.jobmatch.repository.UserRepository;

// @Component
// @Profile("!test")
public class DataSeeder implements CommandLineRunner{
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        Role candidateRole = new Role();
        candidateRole.setName(RoleName.CANDIDATE);
        roleRepository.save(candidateRole);

        Role recruiterRole = new Role();
        recruiterRole.setName(RoleName.RECRUITER);
        roleRepository.save(recruiterRole);

        Role adminRole = new Role();
        adminRole.setName(RoleName.ADMIN);
        roleRepository.save(adminRole);

        // Create a recruiter user
        Recruiter recruiter = new Recruiter();
        recruiter.setEmail("recruiter@gmail.com");
        recruiter.setPassword(passwordEncoder.encode("admin123"));
        recruiter.setFullName("Recruiter");
        recruiter.setPhoneNumber("1234567890");
        recruiter.setRole(recruiterRole);
        recruiter.setIsActive(true);
        userRepository.save(recruiter);

        // Create a candidate user  
        Candidate candidate = new Candidate();
        candidate.setEmail("candidate@gmail.com");
        candidate.setPassword(passwordEncoder.encode("admin123"));
        candidate.setFullName("Candidate");
        candidate.setPhoneNumber("1234567890");
        candidate.setRole(candidateRole);
        candidate.setIsActive(true);
        userRepository.save(candidate);
    }
}
