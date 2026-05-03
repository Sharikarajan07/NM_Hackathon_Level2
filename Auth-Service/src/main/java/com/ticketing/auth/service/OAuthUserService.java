package com.ticketing.auth.service;

import com.ticketing.auth.entity.User;
import com.ticketing.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OAuthUserService {

    private final UserRepository userRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateOAuthUser(
            User user,
            String provider,
            String providerId,
            String firstName,
            String lastName
    ) {
        if (user.getFirstName() == null || user.getFirstName().isBlank()) {
            user.setFirstName(firstName == null || firstName.isBlank() ? "User" : firstName);
        }

        if (user.getLastName() == null) {
            user.setLastName(lastName == null ? "" : lastName);
        }

        if ("google".equals(provider)) {
            user.setGoogleId(providerId);
        } else if ("github".equals(provider)) {
            user.setGithubId(providerId);
        }

        return userRepository.save(user);
    }
}
