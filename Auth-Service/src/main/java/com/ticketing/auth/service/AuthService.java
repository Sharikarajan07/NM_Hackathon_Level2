package com.ticketing.auth.service;

import com.ticketing.auth.dto.AuthResponse;
import com.ticketing.auth.dto.LoginRequest;
import com.ticketing.auth.entity.User;
import com.ticketing.auth.exception.InvalidCredentialsException;
import com.ticketing.auth.exception.UserAlreadyExistsException;
import com.ticketing.auth.repository.UserRepository;
import com.ticketing.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(user.getId(), token, user.getEmail(), user.getFirstName(), 
                              user.getLastName(), user.getRole());
    }

    public AuthResponse register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("This email is already registered. Please login to continue.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Keep the role that was set during signup (USER or ORGANIZER)
        // Only set default role if none was provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole());
        return new AuthResponse(savedUser.getId(), token, savedUser.getEmail(), savedUser.getFirstName(),
                              savedUser.getLastName(), savedUser.getRole());
    }
}
