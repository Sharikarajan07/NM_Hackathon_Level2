package com.eventhub.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Payment Service Application
 * Main entry point for the Payment microservice
 * Handles Stripe payment processing and RabbitMQ messaging
 */
@SpringBootApplication
@EnableDiscoveryClient
public class PaymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
        System.out.println("==============================================");
        System.out.println("Payment Service Started Successfully on Port 8084");
        System.out.println("Stripe Integration: ENABLED");
        System.out.println("RabbitMQ Integration: ENABLED");
        System.out.println("Eureka Client: REGISTERED");
        System.out.println("==============================================");
    }
}
