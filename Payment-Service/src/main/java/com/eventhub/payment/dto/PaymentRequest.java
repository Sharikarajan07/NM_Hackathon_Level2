package com.eventhub.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment Request DTO
 * Represents a payment creation request from the client
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be greater than 0")
    private Double amount;
    
    @NotNull(message = "Currency is required")
    private String currency; // e.g., "usd", "eur", "inr"
    
    private Long userId; // User ID making the payment
    
    private Long eventId; // Event ID for the booking
    
    private String description; // Optional description for the payment
    
    private String customerEmail; // Optional customer email
}
