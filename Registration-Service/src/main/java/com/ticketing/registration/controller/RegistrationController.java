package com.ticketing.registration.controller;

import com.ticketing.registration.entity.Registration;
import com.ticketing.registration.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@CrossOrigin("*")
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<Registration> createRegistration(@RequestBody Registration registration) {
        return ResponseEntity.ok(registrationService.createRegistration(registration));
    }

    
    @GetMapping("/")
    public String home() {
        return "Hello, your app is working!";
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Registration>> getUserRegistrations(@PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getUserRegistrations(userId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Registration>> getEventRegistrations(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getEventRegistrations(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Registration> getRegistrationById(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.getRegistrationById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long id) {
        registrationService.cancelRegistration(id);
        return ResponseEntity.noContent().build();
    }
}
