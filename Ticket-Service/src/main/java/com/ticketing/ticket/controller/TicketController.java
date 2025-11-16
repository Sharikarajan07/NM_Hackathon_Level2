package com.ticketing.ticket.controller;

import com.ticketing.ticket.entity.Ticket;
import com.ticketing.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.createTicket(ticket));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getUserTickets(userId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Ticket>> getEventTickets(@PathVariable Long eventId) {
        return ResponseEntity.ok(ticketService.getEventTickets(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping("/{ticketNumber}/validate")
    public ResponseEntity<Void> validateTicket(@PathVariable String ticketNumber) {
        ticketService.validateTicket(ticketNumber);
        return ResponseEntity.noContent().build();
    }
}
