package com.eventhub.payment.service;

import com.eventhub.payment.dto.*;
import com.eventhub.payment.entity.PaymentRecord;
import com.eventhub.payment.repository.PaymentRecordRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Payment Service
 * Handles Stripe payment operations and RabbitMQ messaging
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final RabbitTemplate rabbitTemplate;
    private final PaymentRecordRepository paymentRecordRepository;

    @Value("${rabbitmq.payment.exchange}")
    private String exchangeName;

    @Value("${rabbitmq.payment.routing-key}")
    private String routingKey;

    /**
     * Create a Stripe Payment Intent
     * @param request Payment request details
     * @return Payment Intent response with client secret
     * @throws StripeException if Stripe API call fails
     */
    public PaymentIntentResponse createPaymentIntent(PaymentRequest request) throws StripeException {
        log.info("Creating Payment Intent for booking: {}, amount: {}{}", 
                request.getBookingId(), request.getAmount(), request.getCurrency().toUpperCase());

        // Convert amount to cents (Stripe requires amount in smallest currency unit)
        Long amountInCents = (long) (request.getAmount() * 100);

        // Build Payment Intent parameters
        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(request.getCurrency().toLowerCase())
                .addPaymentMethodType("card")
                .putMetadata("bookingId", String.valueOf(request.getBookingId()));

        // Add optional description
        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            paramsBuilder.setDescription(request.getDescription());
        } else {
            paramsBuilder.setDescription("Event Ticket Booking #" + request.getBookingId());
        }

        // Add optional customer email
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
            paramsBuilder.setReceiptEmail(request.getCustomerEmail());
        }

        PaymentIntentCreateParams params = paramsBuilder.build();

        // Create Payment Intent via Stripe API
        PaymentIntent paymentIntent = PaymentIntent.create(params);

        log.info("Payment Intent created successfully: {}", paymentIntent.getId());

        // Save payment record to database
        PaymentRecord paymentRecord = new PaymentRecord();
        paymentRecord.setUserId(request.getUserId());
        paymentRecord.setBookingId(request.getBookingId());
        paymentRecord.setEventId(request.getEventId());
        paymentRecord.setTransactionId(paymentIntent.getId());
        paymentRecord.setAmount(BigDecimal.valueOf(request.getAmount()));
        paymentRecord.setCurrency(request.getCurrency());
        paymentRecord.setStatus("PENDING");
        paymentRecord.setCustomerEmail(request.getCustomerEmail());
        paymentRecord.setDescription(request.getDescription());
        paymentRecordRepository.save(paymentRecord);
        log.info("Payment record saved to database: {}", paymentIntent.getId());

        // Return response with client secret
        return new PaymentIntentResponse(
                paymentIntent.getClientSecret(),
                paymentIntent.getId(),
                paymentIntent.getAmount(),
                paymentIntent.getCurrency(),
                paymentIntent.getStatus(),
                request.getBookingId()
        );
    }

    /**
     * Confirm payment and publish message to RabbitMQ
     * @param request Payment confirmation request
     */
    public void confirmPayment(PaymentConfirmRequest request) {
        log.info("Confirming payment for booking: {}, paymentIntentId: {}", 
                request.getBookingId(), request.getPaymentIntentId());

        try {
            // First, confirm the payment intent with Stripe (for test mode)
            PaymentIntent retrievedPaymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());
            
            // If payment intent is not succeeded, try to confirm it with test payment method
            if (!"succeeded".equals(retrievedPaymentIntent.getStatus())) {
                log.info("Payment Intent status is {}, attempting to confirm with test payment method", retrievedPaymentIntent.getStatus());
                
                // For test mode: confirm with test payment method
                PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                        .setPaymentMethod("pm_card_visa") // Stripe test payment method
                        .build();
                
                try {
                    retrievedPaymentIntent = retrievedPaymentIntent.confirm(confirmParams);
                    log.info("Payment Intent confirmed, new status: {}", retrievedPaymentIntent.getStatus());
                } catch (Exception e) {
                    log.warn("Could not auto-confirm payment intent: {}", e.getMessage());
                    // Continue with original payment intent
                }
            }
            
            final PaymentIntent finalPaymentIntent = retrievedPaymentIntent;
            log.info("Retrieved Payment Intent: id={}, status={}", finalPaymentIntent.getId(), finalPaymentIntent.getStatus());

            // Check if payment actually succeeded
            if ("succeeded".equals(finalPaymentIntent.getStatus())) {
                // Payment successful - update database and send SUCCESS message
                String status = "SUCCESS";
                String message = "Payment completed successfully";

                // Update payment record in database
                paymentRecordRepository.findByTransactionId(request.getPaymentIntentId())
                        .ifPresent(record -> {
                            record.setStatus(status);
                            record.setPaymentMethod(finalPaymentIntent.getPaymentMethod());
                            paymentRecordRepository.save(record);
                            log.info("Payment record updated to SUCCESS: transactionId={}", request.getPaymentIntentId());
                        });

                // Create SUCCESS payment message
                PaymentMessage paymentMessage = new PaymentMessage();
                paymentMessage.setBookingId(request.getBookingId());
                paymentMessage.setStatus(status);
                paymentMessage.setTransactionId(request.getPaymentIntentId());
                paymentMessage.setAmount(request.getAmount());
                paymentMessage.setCurrency(request.getCurrency());
                paymentMessage.setTimestamp(LocalDateTime.now());
                paymentMessage.setMessage(message);

                // Fetch user ID from payment record
                paymentRecordRepository.findByTransactionId(request.getPaymentIntentId())
                        .ifPresent(record -> {
                            paymentMessage.setUserId(record.getUserId());
                            paymentMessage.setEventId(record.getEventId() != null ? record.getEventId() : record.getBookingId()); // Use eventId if available, fallback to bookingId
                        });

                // Publish SUCCESS message to RabbitMQ - this will trigger ticket creation
                publishPaymentMessage(paymentMessage);

                log.info("✅ SUCCESS payment message published for booking: {}", request.getBookingId());

            } else {
                // Payment not successful - update to appropriate status but DON'T send to RabbitMQ
                final String finalStatus = finalPaymentIntent.getStatus();
                String status = "PENDING";
                String message = "Payment is " + finalStatus;
                
                log.warn("⚠️ Payment not successful. Status: {} for booking: {}", 
                        finalStatus, request.getBookingId());

                // Update payment record in database only
                paymentRecordRepository.findByTransactionId(request.getPaymentIntentId())
                        .ifPresent(record -> {
                            record.setStatus(status);
                            paymentRecordRepository.save(record);
                            log.info("Payment record updated to PENDING: transactionId={}, reason={}", 
                                    request.getPaymentIntentId(), finalStatus);
                        });

                // Do NOT publish to RabbitMQ for non-successful payments
                log.info("Not publishing to RabbitMQ - payment status is not 'succeeded'");
            }

        } catch (StripeException e) {
            log.error("Error retrieving Payment Intent: {}", e.getMessage(), e);
            
            // Update payment record to FAILED
            paymentRecordRepository.findByTransactionId(request.getPaymentIntentId())
                    .ifPresent(record -> {
                        record.setStatus("FAILED");
                        paymentRecordRepository.save(record);
                        log.info("Payment record marked as FAILED: {}", request.getPaymentIntentId());
                    });
            
            // Send failure message
            PaymentMessage failureMessage = new PaymentMessage();
            failureMessage.setBookingId(request.getBookingId());
            failureMessage.setStatus("FAILED");
            failureMessage.setTransactionId(request.getPaymentIntentId());
            failureMessage.setTimestamp(LocalDateTime.now());
            failureMessage.setMessage("Payment verification failed: " + e.getMessage());

            publishPaymentMessage(failureMessage);
        }
    }

    /**
     * Publish payment message to RabbitMQ
     * @param message Payment message to publish
     */
    private void publishPaymentMessage(PaymentMessage message) {
        try {
            rabbitTemplate.convertAndSend(exchangeName, routingKey, message);
            log.info("Published payment message to exchange: {}, routing key: {}", exchangeName, routingKey);
            log.debug("Message details: {}", message);
        } catch (Exception e) {
            log.error("Failed to publish payment message to RabbitMQ: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish payment message", e);
        }
    }

    /**
     * Get payment history for a user
     * @param userId User ID
     * @return List of payment records
     */
    public List<PaymentRecord> getUserPaymentHistory(Long userId) {
        log.info("Fetching payment history for user: {}", userId);
        return paymentRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Retrieve Payment Intent details
     * @param paymentIntentId Stripe Payment Intent ID
     * @return PaymentIntent object
     */
    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        log.info("Retrieving Payment Intent: {}", paymentIntentId);
        return PaymentIntent.retrieve(paymentIntentId);
    }
}
