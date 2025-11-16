package com.ticketing.event.service;

import com.ticketing.event.entity.Event;
import com.ticketing.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public Event createEvent(Event event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setActive(true);
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findByActive(true);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public List<Event> getEventsByCategory(String category) {
        return eventRepository.findByCategory(category);
    }

    public List<Event> searchEvents(String keyword) {
        return eventRepository.searchEvents(keyword);
    }

    public Event updateEvent(Long id, Event eventDetails) {
        Event event = getEventById(id);
        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setCategory(eventDetails.getCategory());
        event.setLocation(eventDetails.getLocation());
        event.setPrice(eventDetails.getPrice());
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        Event event = getEventById(id);
        event.setActive(false);
        eventRepository.save(event);
    }

    public boolean decreaseAvailableTickets(Long eventId, Integer quantity) {
        Event event = getEventById(eventId);
        if (event.getAvailableTickets() >= quantity) {
            event.setAvailableTickets(event.getAvailableTickets() - quantity);
            eventRepository.save(event);
            return true;
        }
        return false;
    }
}
