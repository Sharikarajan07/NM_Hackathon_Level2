package com.ticketing.event.config;

import com.ticketing.event.entity.Event;
import com.ticketing.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final EventRepository eventRepository;

    @Override
    public void run(String... args) throws Exception {
        if (eventRepository.count() == 0) {
            // Conference Events
            Event event1 = createEvent(
                "Tech Summit 2025",
                "Join industry leaders for the biggest tech conference of the year. Featuring keynotes, workshops, and networking opportunities with top innovators.",
                "Conference",
                "San Francisco Convention Center",
                LocalDateTime.of(2025, 3, 15, 9, 0),
                LocalDateTime.of(2025, 3, 17, 18, 0),
                500, 342, 299.99,
                "Tech Innovators Inc"
            );
            eventRepository.save(event1);

            Event event2 = createEvent(
                "AI & Machine Learning Workshop",
                "Hands-on workshop covering the latest in AI and ML technologies. Learn from experts and build real-world applications.",
                "Workshop",
                "Innovation Hub, Seattle",
                LocalDateTime.of(2025, 4, 10, 10, 0),
                LocalDateTime.of(2025, 4, 10, 17, 0),
                50, 28, 149.99,
                "DataScience Academy"
            );
            eventRepository.save(event2);

            // Music Events
            Event event3 = createEvent(
                "Summer Music Festival",
                "Three-day outdoor music festival featuring over 50 artists across multiple stages. Food, drinks, and camping available.",
                "Music",
                "Golden Gate Park, San Francisco",
                LocalDateTime.of(2025, 7, 20, 12, 0),
                LocalDateTime.of(2025, 7, 22, 23, 0),
                15000, 8450, 199.00,
                "Festival Productions LLC"
            );
            eventRepository.save(event3);

            Event event4 = createEvent(
                "Jazz Night Under the Stars",
                "An evening of smooth jazz featuring renowned local artists. Bring your blanket and enjoy music under the night sky.",
                "Music",
                "Outdoor Amphitheater, Austin",
                LocalDateTime.of(2025, 5, 5, 19, 0),
                LocalDateTime.of(2025, 5, 5, 23, 0),
                200, 156, 75.00,
                "Austin Music Collective"
            );
            eventRepository.save(event4);

            // Sports Events
            Event event5 = createEvent(
                "City Marathon 2025",
                "Annual city marathon with 5K, 10K, half-marathon, and full marathon categories. All fitness levels welcome!",
                "Sports",
                "Downtown Chicago",
                LocalDateTime.of(2025, 9, 10, 7, 0),
                LocalDateTime.of(2025, 9, 10, 14, 0),
                5000, 2890, 45.00,
                "Chicago Runners Association"
            );
            eventRepository.save(event5);

            // Networking Events
            Event event6 = createEvent(
                "Startup Founders Meetup",
                "Monthly networking event for startup founders and entrepreneurs. Share experiences, make connections, and learn from successful founders.",
                "Networking",
                "Tech Hub Coworking, Boston",
                LocalDateTime.of(2025, 3, 25, 18, 0),
                LocalDateTime.of(2025, 3, 25, 21, 0),
                100, 67, 25.00,
                "Boston Startup Network"
            );
            eventRepository.save(event6);

            // Exhibition Events
            Event event7 = createEvent(
                "Modern Art Exhibition",
                "Showcasing contemporary art from emerging artists. Interactive installations and gallery talks throughout the day.",
                "Exhibition",
                "Metropolitan Museum, New York",
                LocalDateTime.of(2025, 4, 1, 10, 0),
                LocalDateTime.of(2025, 4, 30, 18, 0),
                2000, 1245, 35.00,
                "NYC Arts Foundation"
            );
            eventRepository.save(event7);

            Event event8 = createEvent(
                "Food & Wine Expo",
                "Taste dishes from 50+ local restaurants and sample wines from renowned vineyards. Live cooking demonstrations included.",
                "Exhibition",
                "Convention Hall, Portland",
                LocalDateTime.of(2025, 6, 5, 11, 0),
                LocalDateTime.of(2025, 6, 7, 20, 0),
                3000, 1890, 89.00,
                "Culinary Events Co"
            );
            eventRepository.save(event8);

            // Workshop Events
            Event event9 = createEvent(
                "Web Development Bootcamp",
                "Intensive 3-day bootcamp covering React, Node.js, and MongoDB. Build a full-stack application from scratch.",
                "Workshop",
                "Code Academy, Denver",
                LocalDateTime.of(2025, 5, 20, 9, 0),
                LocalDateTime.of(2025, 5, 22, 17, 0),
                40, 15, 399.00,
                "Denver Code School"
            );
            eventRepository.save(event9);

            Event event10 = createEvent(
                "Photography Masterclass",
                "Learn advanced photography techniques from award-winning photographers. Includes equipment workshop and outdoor photo walk.",
                "Workshop",
                "Photo Studio, Los Angeles",
                LocalDateTime.of(2025, 4, 12, 10, 0),
                LocalDateTime.of(2025, 4, 13, 16, 0),
                25, 8, 179.00,
                "LA Photography Academy"
            );
            eventRepository.save(event10);

            // Business Events
            Event event11 = createEvent(
                "Global Business Summit",
                "International business conference bringing together industry leaders, investors, and innovators from around the world.",
                "Conference",
                "World Trade Center, Miami",
                LocalDateTime.of(2025, 10, 5, 8, 0),
                LocalDateTime.of(2025, 10, 7, 19, 0),
                800, 523, 449.00,
                "Global Business Forum"
            );
            eventRepository.save(event11);

            // Entertainment Events
            Event event12 = createEvent(
                "Comedy Night Spectacular",
                "An evening of laughs featuring top comedians from across the country. VIP meet & greet available.",
                "Entertainment",
                "Comedy Club, Las Vegas",
                LocalDateTime.of(2025, 8, 15, 20, 0),
                LocalDateTime.of(2025, 8, 15, 23, 30),
                150, 0, 125.00,
                "Vegas Entertainment Group"
            );
            eventRepository.save(event12);

            System.out.println("✅ Sample events loaded successfully!");
        }
    }

    private Event createEvent(String title, String description, String category, String location,
                              LocalDateTime startDate, LocalDateTime endDate, int totalTickets,
                              int availableTickets, double price, String organizer) {
        Event event = new Event();
        event.setTitle(title);
        event.setDescription(description);
        event.setCategory(category);
        event.setLocation(location);
        event.setStartDate(startDate);
        event.setEndDate(endDate);
        event.setTotalTickets(totalTickets);
        event.setAvailableTickets(availableTickets);
        event.setPrice(price);
        event.setOrganizer(organizer);
        event.setActive(true);
        event.setCreatedAt(LocalDateTime.now());
        event.setImageUrl(null);
        return event;
    }
}
