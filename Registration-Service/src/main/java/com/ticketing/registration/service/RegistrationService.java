package com.ticketing.registration.service;

import com.ticketing.registration.client.TicketServiceClient;
import com.ticketing.registration.entity.Registration;
import com.ticketing.registration.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final TicketServiceClient ticketServiceClient;

    public Registration createRegistration(Registration registration) {
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus("CONFIRMED");
        Registration savedRegistration = registrationRepository.save(registration);
        
        // Create tickets for each registration
        try {
            for (int i = 0; i < savedRegistration.getNumberOfTickets(); i++) {
                Map<String, Object> ticketRequest = new HashMap<>();
                ticketRequest.put("ticketNumber", generateTicketNumber());
                ticketRequest.put("registrationId", savedRegistration.getId());
                ticketRequest.put("eventId", savedRegistration.getEventId());
                ticketRequest.put("userId", savedRegistration.getUserId());
                ticketRequest.put("status", "ACTIVE");
                ticketRequest.put("price", savedRegistration.getTotalPrice() / savedRegistration.getNumberOfTickets());
                
                ticketServiceClient.createTicket(ticketRequest);
            }
        } catch (Exception e) {
            System.err.println("Failed to create tickets: " + e.getMessage());
            // Don't fail the registration if ticket creation fails
        }
        
        return savedRegistration;
    }
    
    private String generateTicketNumber() {
        return "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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
