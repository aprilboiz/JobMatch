package com.aprilboiz.jobmatch.service.impl;

import java.util.List;

import org.apache.commons.lang3.EnumUtils;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aprilboiz.jobmatch.dto.request.CandidateProfileUpdateRequest;
import com.aprilboiz.jobmatch.dto.request.RecruiterProfileUpdateRequest;
import com.aprilboiz.jobmatch.dto.request.RegisterRequest;
import com.aprilboiz.jobmatch.dto.response.UserResponse;
import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.exception.DuplicateException;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.model.UserPrincipal;
import com.aprilboiz.jobmatch.repository.CandidateRepository;
import com.aprilboiz.jobmatch.repository.CompanyRepository;
import com.aprilboiz.jobmatch.repository.RecruiterRepository;
import com.aprilboiz.jobmatch.repository.RoleRepository;
import com.aprilboiz.jobmatch.repository.UserRepository;
import com.aprilboiz.jobmatch.service.UserService;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final RecruiterRepository recruiterRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, CandidateRepository candidateRepository, RecruiterRepository recruiterRepository, RoleRepository roleRepository, CompanyRepository companyRepository, PasswordEncoder passwordEncoder, ApplicationMapper userMapper) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.recruiterRepository = recruiterRepository;
        this.roleRepository = roleRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.getUserByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User with email " + username + " not found!"));
        return new UserPrincipal(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createUser(RegisterRequest registerRequest) {
        User existedUser = userRepository.getUserByEmail(registerRequest.getEmail()).orElse(null);
        if (existedUser != null) {
            throw new DuplicateException("User with this email already exists!");
        }

        if (registerRequest.getRole() == null) {
            throw new IllegalArgumentException("Role is required!");
        }

        if (!EnumUtils.isValidEnum(RoleName.class, registerRequest.getRole().toUpperCase())) {
            throw new IllegalArgumentException("Invalid role '%s'".formatted(registerRequest.getRole()));
        }

        RoleName roleName = RoleName.valueOf(registerRequest.getRole().toUpperCase());
        Role role = roleRepository.findByName(roleName).orElseThrow(() -> new NotFoundException("Role with name '%s' not found!".formatted(registerRequest.getRole())));

        User newUser = User.builder()
            .email(registerRequest.getEmail())
            .password(passwordEncoder.encode(registerRequest.getPassword()))
            .role(role)
            .build();
        userRepository.save(newUser);

        switch (roleName) {
            case CANDIDATE -> {
                Candidate newCandidate = Candidate.builder()
                    .user(newUser)
                    .fullName(registerRequest.getFullName())
                    .phoneNumber(registerRequest.getPhoneNumber())
                    .build();

                candidateRepository.save(newCandidate);
            }
            case RECRUITER -> {
                Recruiter newRecruiter = Recruiter.builder()
                    .user(newUser)
                    .fullName(registerRequest.getFullName())
                    .phoneNumber(registerRequest.getPhoneNumber())
                    .build();

                recruiterRepository.save(newRecruiter);
            }
            default -> {
                throw new IllegalArgumentException("Invalid role '%s'".formatted(registerRequest.getRole()));
            }
        }
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream().map(userMapper::userToUserResponse).toList();
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User with id " + id + " not found!"));
        return userMapper.userToUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.getUserByEmail(email).orElseThrow(() -> new NotFoundException("User with email " + email + " not found!"));
        return userMapper.userToUserResponse(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateProfile(String email, CandidateProfileUpdateRequest profileRequest) {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found!"));

        if (user.getRole().getName() != RoleName.CANDIDATE) {
            throw new AuthorizationDeniedException("User is not a candidate");
        }

        Candidate candidate = user.getCandidate();
        if (candidate == null) {
            throw new NotFoundException("Candidate profile not found!");
        }

        candidate.setFullName(profileRequest.getFullName());
        candidate.setPhoneNumber(profileRequest.getPhoneNumber());
        candidateRepository.save(candidate);

        return userMapper.userToUserResponse(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateProfile(String email, RecruiterProfileUpdateRequest profileRequest) {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found!"));

        if (user.getRole().getName() != RoleName.RECRUITER) {
            throw new AuthorizationDeniedException("User is not a recruiter");
        }

        Recruiter recruiter = user.getRecruiter();
        if (recruiter == null) {
            throw new NotFoundException("Recruiter profile not found!");
        }

        recruiter.setFullName(profileRequest.getFullName());
        recruiter.setPhoneNumber(profileRequest.getPhoneNumber());

        if (profileRequest.getCompanyId() != null) {
            Company company = companyRepository.findById(profileRequest.getCompanyId())
                    .orElseThrow(() -> new NotFoundException("Company not found!"));
            recruiter.setCompany(company);
        }

        recruiterRepository.save(recruiter);

        return userMapper.userToUserResponse(user);
    }
}
