package com.example.WeeklyReport.service;

import com.example.WeeklyReport.dto.AuthRequest;
import com.example.WeeklyReport.dto.AuthResponse;
import com.example.WeeklyReport.dto.RegisterRequest;
import com.example.WeeklyReport.config.JwtService;
import com.example.WeeklyReport.entity.User;
import com.example.WeeklyReport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        if ("MANAGER".equalsIgnoreCase(request.getRole())) {
            user.setRole(User.Role.MANAGER);
        } else {
            user.setRole(User.Role.TEAM_MEMBER);
        }
        userRepository.save(user);
        return "User registered successfully";
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getFullName());
    }
}