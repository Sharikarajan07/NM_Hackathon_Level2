# Notification Service - Overview

## Purpose

The **Notification-Service** is a microservice designed to handle email notifications for the Event Management Platform. While it's currently set up in the architecture, the frontend integration is prepared for future implementation.

## Current Status

✅ **Service Status**: Running as part of the microservices architecture  
⚠️ **Frontend Integration**: Prepared but not actively sending emails yet  
🔧 **Future Ready**: Settings available in Profile page for user preferences

## Intended Functionality

### 1. Email Notifications
- **Event Registration Confirmation**: Send email when user registers for an event
- **Ticket Generation**: Email ticket details with QR code
- **Event Reminders**: Notify users before their registered events start
- **Event Updates**: Alert users about changes to events they're registered for

### 2. User Preferences (Already in UI)
Located in **Profile Page** → **Notification Preferences** section:
- **Email Notifications Toggle**: Enable/disable all email communications
- **Event Reminders Toggle**: Control pre-event notification settings

## Technical Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │─────▶│  API Gateway     │─────▶│ Notification    │
│   (React/Next)  │      │  (Port 8080)     │      │ Service         │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                            │
                                                            ▼
                                                    ┌──────────────┐
                                                    │ Email Server │
                                                    │ (SMTP/Gmail) │
                                                    └──────────────┘
```

## Why It's Included

1. **Production Readiness**: Professional event platforms require notification systems
2. **User Experience**: Automated emails improve engagement and reduce no-shows
3. **Scalability**: Separate microservice allows independent scaling
4. **Best Practice**: Follows event-driven architecture patterns

## Future Implementation Steps

When you're ready to activate email notifications:

### Backend Configuration
1. Configure SMTP server in `application.properties`:
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   ```

2. Implement email templates for:
   - Registration confirmation
   - Ticket generation
   - Event reminders
   - Event cancellations/updates

### Frontend Integration
1. Connect notification preferences to backend API
2. Store user settings in database
3. Trigger notifications on key events (registration, ticket generation)

## Current UI Features (Already Implemented)

✅ **Profile Page Settings**:
- Email Notifications toggle (with toast feedback)
- Event Reminders toggle (with toast feedback)
- Visual state management
- User-friendly interface

## Benefits

- **Automated Communication**: Reduces manual work
- **User Engagement**: Keeps attendees informed
- **Professional Touch**: Matches industry-standard platforms
- **Reminder System**: Decreases event no-shows
- **Scalable**: Can handle thousands of notifications

## Note

The Notification Service demonstrates **production-level architecture** even if not actively sending emails yet. It shows proper microservices separation and readiness for enterprise features.

---

**Status**: Infrastructure ready, waiting for email server configuration and full activation.
