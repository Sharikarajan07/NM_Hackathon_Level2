package com.ticketing.notification.service;

import com.ticketing.notification.entity.Notification;
import com.ticketing.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public Notification createNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setStatus("UNREAD");
        Notification savedNotification = notificationRepository.save(notification);

        // Send email notification
        if (notification.getRecipientEmail() != null) {
            sendEmailNotification(notification);
        }

        return savedNotification;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndStatus(userId, "UNREAD");
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    public void markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.setStatus("READ");
        notificationRepository.save(notification);
    }

    private void sendEmailNotification(Notification notification) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(notification.getRecipientEmail());
            message.setSubject(notification.getTitle());
            message.setText(notification.getMessage());
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Error sending email: " + e.getMessage());
        }
    }
}
