package com.eventhub.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment Intent Response DTO
 * Response containing Stripe client secret for frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentResponse {
    
    private String clientSecret;
    
    private String paymentIntentId;
    
    private Long amount; // Amount in cents
    
    private String currency;
    
    private String status;
    
    private Long bookingId;
}
