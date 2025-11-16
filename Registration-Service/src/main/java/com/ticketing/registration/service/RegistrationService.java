package com.ticketing.registration.service;

import com.ticketing.registration.entity.Registration;
import com.ticketing.registration.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;

    public Registration createRegistration(Registration registration) {
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus("CONFIRMED");
        return registrationRepository.save(registration);
    }

    public List<Registration> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public List<Registration> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public Registration getRegistrationById(Long id) {
        return registrationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registration not found"));
    }

    public void cancelRegistration(Long id) {
        Registration registration = getRegistrationById(id);
        registration.setStatus("CANCELLED");
        registrationRepository.save(registration);
    }
}
