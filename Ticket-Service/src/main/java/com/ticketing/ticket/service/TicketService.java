package com.ticketing.ticket.service;

import com.ticketing.ticket.entity.Ticket;
import com.ticketing.ticket.repository.TicketRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    public Ticket createTicket(Ticket ticket) {
        ticket.setTicketNumber(UUID.randomUUID().toString());
        ticket.setIssuedAt(LocalDateTime.now());
        ticket.setStatus("ACTIVE");
        ticket.setQrCode(generateQRCode(ticket.getTicketNumber()));
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getUserTickets(Long userId) {
        return ticketRepository.findByUserId(userId);
    }

    public List<Ticket> getEventTickets(Long eventId) {
        return ticketRepository.findByEventId(eventId);
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Ticket getTicketByNumber(String ticketNumber) {
        return ticketRepository.findByTicketNumber(ticketNumber)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public void validateTicket(String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Ticket is not active");
        }

        ticket.setStatus("USED");
        ticketRepository.save(ticket);
    }

    private String generateQRCode(String text) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new RuntimeException("Error generating QR code", e);
        }
    }
}
