package com.eventhub.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment Confirmation Request DTO
 * Used to confirm a payment and notify booking service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequest {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Payment Intent ID is required")
    private String paymentIntentId;
    
    private Double amount;
    
    private String currency;
}
