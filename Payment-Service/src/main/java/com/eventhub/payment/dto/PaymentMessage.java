package com.eventhub.payment.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Payment Message DTO
 * Message sent to RabbitMQ for booking service consumption
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMessage implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Long bookingId;
    
    private Long userId; // NEW: User ID for ticket creation
    
    private Long eventId; // NEW: Event ID for ticket creation
    
    private String status; // SUCCESS, FAILED, PENDING
    
    private String transactionId; // Stripe Payment Intent ID
    
    private Double amount;
    
    private String currency;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    private String message;

    /**
     * Constructor for success messages
     */
    public PaymentMessage(Long bookingId, String status, String transactionId) {
        this.bookingId = bookingId;
        this.status = status;
        this.transactionId = transactionId;
        this.timestamp = LocalDateTime.now();
    }
}
