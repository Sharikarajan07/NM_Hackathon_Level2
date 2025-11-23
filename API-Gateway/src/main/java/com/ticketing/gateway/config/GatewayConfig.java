package com.ticketing.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("auth-service", r -> r
                .path("/api/auth/**")
                .uri("lb://AUTH-SERVICE"))
            .route("event-service", r -> r
                .path("/api/events/**")
                .uri("lb://EVENT-SERVICE"))
            .route("registration-service", r -> r
                .path("/api/registrations/**")
                .uri("lb://REGISTRATION-SERVICE"))
            .route("ticket-service", r -> r
                .path("/api/tickets/**")
                .uri("lb://TICKET-SERVICE"))
            .route("payment-service", r -> r
                .path("/api/payments/**")
                .uri("lb://PAYMENT-SERVICE"))
            .route("notification-service", r -> r
                .path("/api/notifications/**")
                .uri("lb://NOTIFICATION-SERVICE"))
            .build();
    }
}
