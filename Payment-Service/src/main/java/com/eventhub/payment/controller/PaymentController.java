package com.eventhub.payment.controller;

import com.eventhub.payment.dto.PaymentConfirmRequest;
import com.eventhub.payment.dto.PaymentIntentResponse;
import com.eventhub.payment.dto.PaymentRequest;
import com.eventhub.payment.entity.PaymentRecord;
import com.eventhub.payment.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Payment Controller
 * REST endpoints for payment operations
 */
@RestController
@RequestMapping("/api/payments")
@Slf4j
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    /**
     * Initialize Stripe API key
     */
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        log.info("Stripe API initialized successfully");
        log.info("Using Stripe API version: {}", Stripe.API_VERSION);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Payment Service");
        response.put("stripe", "Connected");
        return ResponseEntity.ok(response);
    }

    /**
     * Create Payment Intent
     * Endpoint 1: POST /payments/create-intent
     * 
     * @param request Payment request with amount, currency, and bookingId
     * @return Payment Intent response with client secret
     */
    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(@Valid @RequestBody PaymentRequest request) {
        try {
            log.info("Received payment intent creation request for booking: {}", request.getBookingId());
            
            PaymentIntentResponse response = paymentService.createPaymentIntent(request);
            
            log.info("Payment intent created successfully: {}", response.getPaymentIntentId());
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            log.error("Stripe API error while creating payment intent: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Payment processing failed");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("code", e.getCode());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Unexpected error while creating payment intent: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Confirm Payment
     * Endpoint 2: POST /payments/confirm
     * 
     * @param request Payment confirmation request with bookingId and paymentIntentId
     * @return Success response
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@Valid @RequestBody PaymentConfirmRequest request) {
        try {
            log.info("Received payment confirmation request for booking: {}", request.getBookingId());
            
            paymentService.confirmPayment(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment confirmed and notification sent to booking service");
            response.put("bookingId", request.getBookingId());
            response.put("paymentIntentId", request.getPaymentIntentId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error confirming payment: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Payment confirmation failed");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get Payment Intent details
     * 
     * @param paymentIntentId Stripe Payment Intent ID
     * @return Payment Intent details
     */
    @GetMapping("/intent/{paymentIntentId}")
    public ResponseEntity<?> getPaymentIntent(@PathVariable String paymentIntentId) {
        try {
            log.info("Retrieving payment intent: {}", paymentIntentId);
            
            PaymentIntent paymentIntent = paymentService.getPaymentIntent(paymentIntentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", paymentIntent.getId());
            response.put("amount", paymentIntent.getAmount());
            response.put("currency", paymentIntent.getCurrency());
            response.put("status", paymentIntent.getStatus());
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("metadata", paymentIntent.getMetadata());
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            log.error("Stripe API error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve payment intent");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Cancel Payment Intent
     * 
     * @param paymentIntentId Stripe Payment Intent ID
     * @return Cancellation confirmation
     */
    @PostMapping("/cancel/{paymentIntentId}")
    public ResponseEntity<?> cancelPaymentIntent(@PathVariable String paymentIntentId) {
        try {
            log.info("Cancelling payment intent: {}", paymentIntentId);
            
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            PaymentIntent cancelledIntent = paymentIntent.cancel();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment intent cancelled successfully");
            response.put("id", cancelledIntent.getId());
            response.put("status", cancelledIntent.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            log.error("Error cancelling payment intent: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to cancel payment intent");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get payment history for a user
     * @param userId User ID
     * @return List of payment records
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getPaymentHistory(@PathVariable Long userId) {
        try {
            log.info("Fetching payment history for user: {}", userId);
            List<PaymentRecord> paymentHistory = paymentService.getUserPaymentHistory(userId);
            
            return ResponseEntity.ok(paymentHistory);
            
        } catch (Exception e) {
            log.error("Error fetching payment history: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch payment history");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
