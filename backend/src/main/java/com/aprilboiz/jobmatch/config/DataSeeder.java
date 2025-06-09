package com.aprilboiz.jobmatch.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.repository.RecruiterRepository;
import com.aprilboiz.jobmatch.repository.RoleRepository;
import com.aprilboiz.jobmatch.repository.CandidateRepository;
import com.aprilboiz.jobmatch.repository.UserRepository;

@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner{
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RecruiterRepository recruiterRepository;
    private final CandidateRepository candidateRepository;

    public DataSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder, RecruiterRepository recruiterRepository, CandidateRepository candidateRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.recruiterRepository = recruiterRepository;
        this.candidateRepository = candidateRepository;
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

        User admin = new User();
        admin.setEmail("admin@gmail.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(adminRole);
        userRepository.save(admin);

        User recruiter = new User();
        recruiter.setEmail("recruiter@gmail.com");
        recruiter.setPassword(passwordEncoder.encode("admin123"));
        recruiter.setRole(recruiterRole);
        userRepository.save(recruiter);

        Recruiter recruiterModel = new Recruiter();
        recruiterModel.setUser(recruiter);
        recruiterModel.setFullName("Recruiter");
        recruiterModel.setPhoneNumber("1234567890");
        recruiterRepository.save(recruiterModel);

        User candidate = new User();
        candidate.setEmail("candidate@gmail.com");
        candidate.setPassword(passwordEncoder.encode("admin123"));
        candidate.setRole(candidateRole);
        userRepository.save(candidate);

        Candidate candidateModel = new Candidate();
        candidateModel.setUser(candidate);
        candidateModel.setFullName("Candidate");
        candidateModel.setPhoneNumber("1234567890");
        candidateRepository.save(candidateModel);
    }
}
