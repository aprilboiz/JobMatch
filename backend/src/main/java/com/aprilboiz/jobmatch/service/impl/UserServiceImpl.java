package com.aprilboiz.jobmatch.service.impl;

import java.util.List;
import java.util.Optional;

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
import com.aprilboiz.jobmatch.dto.base.BaseProfileUpdateRequest;
import com.aprilboiz.jobmatch.enumerate.RoleName;
import com.aprilboiz.jobmatch.exception.DuplicateException;
import com.aprilboiz.jobmatch.exception.NotFoundException;
import com.aprilboiz.jobmatch.mapper.ApplicationMapper;
import com.aprilboiz.jobmatch.model.Candidate;
import com.aprilboiz.jobmatch.model.Company;
import com.aprilboiz.jobmatch.model.Recruiter;
import com.aprilboiz.jobmatch.model.Role;
import com.aprilboiz.jobmatch.model.User;
import com.aprilboiz.jobmatch.model.UserPrincipalAdapter;
import com.aprilboiz.jobmatch.repository.CompanyRepository;
import com.aprilboiz.jobmatch.repository.RoleRepository;
import com.aprilboiz.jobmatch.repository.UserRepository;
import com.aprilboiz.jobmatch.service.CloudinaryService;
import com.aprilboiz.jobmatch.service.MessageService;
import com.aprilboiz.jobmatch.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationMapper userMapper;
    private final MessageService messageService;
    private final CloudinaryService cloudinaryService;

    

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.getUserByEmail(username).orElseThrow(() -> 
            new UsernameNotFoundException(messageService.getMessage("error.user.username.not.found", username)));
        return new UserPrincipalAdapter(user);
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

        User newUser;
        switch (roleName) {
            case CANDIDATE -> newUser = Candidate.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .phoneNumber(registerRequest.getPhoneNumber())
                .role(role)
                .isActive(true)
                .build();
            case RECRUITER -> newUser = Recruiter.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .phoneNumber(registerRequest.getPhoneNumber())
                .role(role)
                .isActive(true)
                .build();
            default -> throw new IllegalArgumentException(messageService.getMessage("validation.invalid.role", registerRequest.getRole()));
        }

        userRepository.save(newUser);
        log.info("Successfully created user with email: {}", newUser.getEmail());
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
    public UserResponse updateProfile(String email, BaseProfileUpdateRequest profileRequest) {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.user.email", email)));

        if (user instanceof Candidate) {
            // Create CandidateProfileUpdateRequest from BaseProfileUpdateRequest
            CandidateProfileUpdateRequest candidateRequest = new CandidateProfileUpdateRequest();
            candidateRequest.setFullName(profileRequest.getFullName());
            candidateRequest.setPhoneNumber(profileRequest.getPhoneNumber());
            return updateProfile(email, candidateRequest);
        } else if (user instanceof Recruiter) {
            // Create RecruiterProfileUpdateRequest from BaseProfileUpdateRequest
            RecruiterProfileUpdateRequest recruiterRequest = new RecruiterProfileUpdateRequest();
            recruiterRequest.setFullName(profileRequest.getFullName());
            recruiterRequest.setPhoneNumber(profileRequest.getPhoneNumber());
            recruiterRequest.setCompanyId(profileRequest.getCompanyId());
            return updateProfile(email, recruiterRequest);
        } else {
            throw new AuthorizationDeniedException(messageService.getMessage("error.authorization.user.type.invalid"));
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateProfile(String email, CandidateProfileUpdateRequest profileRequest) {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.user.email", email)));

        if (!(user instanceof Candidate candidate)) {
            throw new AuthorizationDeniedException(messageService.getMessage("error.authorization.candidate.required"));
        }

        candidate.setFullName(profileRequest.getFullName());
        candidate.setPhoneNumber(profileRequest.getPhoneNumber());
        userRepository.save(candidate);

        return userMapper.userToUserResponse(candidate);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateProfile(String email, RecruiterProfileUpdateRequest profileRequest) {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.user.email", email)));

        if (!(user instanceof Recruiter recruiter)) {
            throw new AuthorizationDeniedException(messageService.getMessage("error.authorization.recruiter.required"));
        }

        recruiter.setFullName(profileRequest.getFullName());
        recruiter.setPhoneNumber(profileRequest.getPhoneNumber());

        if (profileRequest.getCompanyId() != null) {
            Company company = companyRepository.findById(profileRequest.getCompanyId())
                    .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.not.found.company")));
            recruiter.setCompany(company);
        }

        userRepository.save(recruiter);

        return userMapper.userToUserResponse(recruiter);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUserAvatar(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(messageService.getMessage("error.user.not.found", userId)));

        // Delete old avatar if exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            try {
                String oldPublicId = cloudinaryService.extractPublicIdFromUrl(user.getAvatarUrl());
                if (oldPublicId != null) {
                    cloudinaryService.delete(oldPublicId);
                }
            } catch (Exception e) {
                log.warn("Failed to delete old avatar for user {}: {}", userId, e.getMessage());
            }
        }

        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        log.info("Successfully updated avatar for user {}", userId);
    }
}
