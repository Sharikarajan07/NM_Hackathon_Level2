package com.eventhub.payment.repository;

import com.eventhub.payment.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    
    List<PaymentRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<PaymentRecord> findByBookingId(Long bookingId);
    
    Optional<PaymentRecord> findByTransactionId(String transactionId);
    
    List<PaymentRecord> findByStatus(String status);
}
