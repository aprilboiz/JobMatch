package com.aprilboiz.jobmatch.service.impl;

import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.EnumUtils;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
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
import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.service.UserService;

@Service
public class UserServiceImpl implements UserService, UserDetailsService {
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final RecruiterRepository recruiterRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationMapper userMapper;
    private final MessageService messageService;

    public UserServiceImpl(UserRepository userRepository, CandidateRepository candidateRepository, RecruiterRepository recruiterRepository, RoleRepository roleRepository, CompanyRepository companyRepository, PasswordEncoder passwordEncoder, ApplicationMapper userMapper, MessageService messageService) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.recruiterRepository = recruiterRepository;
        this.roleRepository = roleRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.messageService = messageService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.getUserByEmail(username).orElseThrow(() -> 
            new UsernameNotFoundException(messageService.getMessage("error.user.username.not.found", username)));
        return new UserPrincipal(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createUser(RegisterRequest registerRequest) {
        Optional<User> existingUser = userRepository.getUserByEmail(registerRequest.getEmail());
        if (existingUser.isPresent()) {
            throw new DuplicateException(messageService.getMessage("error.user.duplicate"));
        }

        if (registerRequest.getRole() == null) {
            throw new IllegalArgumentException(messageService.getMessage("validation.required.role"));
        }

        if (!EnumUtils.isValidEnum(RoleName.class, registerRequest.getRole().toUpperCase())) {
            throw new IllegalArgumentException(messageService.getMessage("validation.invalid.role", registerRequest.getRole()));
        }

        RoleName roleName = RoleName.valueOf(registerRequest.getRole().toUpperCase());
        Role role = roleRepository.findByName(roleName).orElseThrow(() -> new NotFoundException(messageService.getMessage("error.role.not.found", registerRequest.getRole())));

        User newUser = User.builder()
            .email(registerRequest.getEmail())
            .password(passwordEncoder.encode(registerRequest.getPassword()))
            .role(role)
            .isActive(true)
            .build();
        User savedUser = userRepository.save(newUser);

        switch (roleName) {
            case CANDIDATE -> {
                Candidate newCandidate = Candidate.builder()
                    .user(savedUser)
                    .fullName(registerRequest.getFullName())
                    .phoneNumber(registerRequest.getPhoneNumber())
                    .build();
                savedUser.setCandidate(newCandidate);
                candidateRepository.save(newCandidate);
            }
            case RECRUITER -> {
                Recruiter newRecruiter = Recruiter.builder()
                    .user(savedUser)
                    .fullName(registerRequest.getFullName())
                    .phoneNumber(registerRequest.getPhoneNumber())
                    .build();
                savedUser.setRecruiter(newRecruiter);
                recruiterRepository.save(newRecruiter);
            }
            default -> {
                throw new IllegalArgumentException(messageService.getMessage("validation.invalid.role", registerRequest.getRole()));
            }
        }

        userRepository.save(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream().map(userMapper::userToUserResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.user.not.found", id)));
        return userMapper.userToUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.getUserByEmail(email).orElseThrow(() -> 
            new NotFoundException(messageService.getMessage("error.user.email.not.found", email)));
        return userMapper.userToUserResponse(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateProfile(String email, CandidateProfileUpdateRequest profileRequest) {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.user.email", email)));

        if (user.getRole().getName() != RoleName.CANDIDATE) {
            throw new AuthorizationDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }

        Candidate candidate = user.getCandidate();
        if (candidate == null) {
            throw new NotFoundException(messageService.getMessage("error.not.found.candidate"));
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
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.user.email", email)));

        if (user.getRole().getName() != RoleName.RECRUITER) {
            throw new AuthorizationDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        Recruiter recruiter = user.getRecruiter();
        if (recruiter == null) {
            throw new NotFoundException(messageService.getMessage("error.not.found.recruiter"));
        }

        recruiter.setFullName(profileRequest.getFullName());
        recruiter.setPhoneNumber(profileRequest.getPhoneNumber());

        if (profileRequest.getCompanyId() != null) {
            Company company = companyRepository.findById(profileRequest.getCompanyId())
                    .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.company")));
            recruiter.setCompany(company);
        }

        recruiterRepository.save(recruiter);

        return userMapper.userToUserResponse(user);
    }
}
