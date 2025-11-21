package com.ticketing.registration.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ticket-service")
public interface TicketServiceClient {
    
    @PostMapping("/api/tickets")
    Object createTicket(@RequestBody Object ticketRequest);
}
