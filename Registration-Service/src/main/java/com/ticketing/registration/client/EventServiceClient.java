package com.ticketing.registration.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "event-service")
public interface EventServiceClient {
    
    @GetMapping("/api/events/{id}")
    Object getEventById(@PathVariable("id") Long id);
}
