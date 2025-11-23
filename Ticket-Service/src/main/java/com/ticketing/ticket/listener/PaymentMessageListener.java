package com.ticketing.ticket.listener;

import com.ticketing.ticket.dto.PaymentMessage;
import com.ticketing.ticket.entity.Ticket;
import com.ticketing.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * RabbitMQ Message Listener for Payment Events
 * Automatically creates tickets when payment is confirmed
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentMessageListener {

    private final TicketService ticketService;

    @RabbitListener(queues = "payment_queue")
    public void handlePaymentMessage(PaymentMessage message) {
        log.info("📬 Received payment message: {}", message);
        
        try {
            if ("SUCCESS".equals(message.getStatus())) {
                // Create ticket for successful payment
                Ticket ticket = new Ticket();
                ticket.setTicketNumber(generateTicketNumber());
                ticket.setRegistrationId(message.getBookingId()); // Use bookingId as registrationId
                ticket.setEventId(message.getEventId() != null ? message.getEventId() : extractEventIdFromBooking(message.getBookingId())); // Use eventId from message
                ticket.setUserId(message.getUserId() != null ? message.getUserId() : extractUserIdFromBooking(message.getBookingId())); // Use userId from message
                ticket.setStatus("CONFIRMED");
                ticket.setIssuedAt(LocalDateTime.now());
                ticket.setPrice(message.getAmount());
                ticket.setQrCode(message.getTransactionId()); // Use transaction ID in QR
                
                Ticket createdTicket = ticketService.createTicket(ticket);
                log.info("✅ Ticket created successfully: ticketNumber={}, userId={}, eventId={}", 
                        createdTicket.getTicketNumber(), createdTicket.getUserId(), createdTicket.getEventId());
                
            } else {
                log.warn("⚠️ Payment not successful. Status: {}", message.getStatus());
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to process payment message: {}", e.getMessage(), e);
            throw e; // Rethrow to trigger RabbitMQ retry
        }
    }
    
    private String generateTicketNumber() {
        return "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private Long extractEventIdFromBooking(Long bookingId) {
        // For demo: extract from bookingId or use default
        // In production, fetch from Registration Service
        return bookingId % 10; // Simple extraction logic
    }
    
    private Long extractUserIdFromBooking(Long bookingId) {
        // For demo: extract from bookingId or use default
        // In production, fetch from Registration Service
        return bookingId / 100; // Simple extraction logic
    }
}
