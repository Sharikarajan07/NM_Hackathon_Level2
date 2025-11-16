package com.ticketing.event.repository;

import com.ticketing.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCategory(String category);
    List<Event> findByActive(Boolean active);
    
    @Query("SELECT e FROM Event e WHERE e.title LIKE %?1% OR e.description LIKE %?1%")
    List<Event> searchEvents(String keyword);
}
