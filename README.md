# Event Ticketing System - Microservices Architecture

Complete event ticketing system with microservices architecture using Spring Boot, Spring Cloud, and Next.js.

## 🏗️ Architecture Overview

```
Frontend (Next.js - Port 3000)
        |
        v
API Gateway (Port 8080)
    |    |    |    |    |
    v    v    v    v    v
Auth  Event  Reg  Ticket  Notif
(8081)(8082)(8083)(8084) (8085)
    |    |    |    |    |
    v    v    v    v    v
  H2   H2   H2   H2   H2
  DB   DB   DB   DB   DB
  
All services register with Eureka Server (8761)
```

## 🚀 Services

### 1. Eureka Server (Port 8761)
Service discovery and registry for all microservices.
- **URL**: http://localhost:8761
- **Credentials**: `admin` / `admin123`
- View all registered services and their health status

### 2. API Gateway (Port 8080)
Central entry point for all client requests.
- Routes to auth, event, registration, ticket, and notification services
- Load balancing and service discovery integration

### 3. Auth Service (Port 8081)
User authentication and JWT token management.
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login with JWT token
- H2 Console: http://localhost:8081/h2-console

### 4. Event Service (Port 8082)
Event creation and management.
- `GET /api/events` - Get all active events
- `GET /api/events/{id}` - Get event details
- `GET /api/events/category/{category}` - Filter by category
- `GET /api/events/search/{keyword}` - Search events
- `POST /api/events` - Create new event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Soft delete event
- H2 Console: http://localhost:8082/h2-console

### 5. Registration Service (Port 8083)
Event registration and attendee management.
- `POST /api/registrations` - Register for event
- `GET /api/registrations/user/{userId}` - User's registrations
- `GET /api/registrations/event/{eventId}` - Event registrations
- `DELETE /api/registrations/{id}` - Cancel registration
- H2 Console: http://localhost:8083/h2-console

### 6. Ticket Service (Port 8084)
Ticket generation with QR codes.
- `POST /api/tickets` - Generate ticket with QR code
- `GET /api/tickets/user/{userId}` - User's tickets
- `GET /api/tickets/event/{eventId}` - Event tickets
- `POST /api/tickets/{ticketNumber}/validate` - Validate ticket
- H2 Console: http://localhost:8084/h2-console

### 7. Notification Service (Port 8085)
Email notifications and messaging.
- `POST /api/notifications` - Send notification
- `GET /api/notifications/user/{userId}` - User notifications
- `GET /api/notifications/user/{userId}/unread` - Unread notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- H2 Console: http://localhost:8085/h2-console

## 📋 Prerequisites

- **Java 17+** (JDK 17 or higher)
- **Maven 3.8+** (Apache Maven)
- **Node.js 18+** (for Next.js frontend)
- **pnpm** (Node package manager)

## 🛠️ Setup Instructions

### Step 1: Install Maven (Windows PowerShell)

```powershell
# Download and install Maven
$url = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
$output = "$env:TEMP\maven.zip"
Invoke-WebRequest -Uri $url -OutFile $output
Expand-Archive -Path $output -DestinationPath "C:\maven" -Force

# Set environment variables
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot", [EnvironmentVariableTarget]::User)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\maven\apache-maven-3.9.6\bin", [EnvironmentVariableTarget]::User)

# Refresh current session
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:Path += ";C:\maven\apache-maven-3.9.6\bin"

# Verify installation
mvn -version
```

### Step 2: Start Backend Services (In Order)

**1. Start Eureka Server** (Wait ~30 seconds for full startup)
```powershell
cd Eureka-Server
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:Path = "C:\maven\apache-maven-3.9.6\bin;" + $env:Path
mvn spring-boot:run
```

**2. Start API Gateway** (Wait ~20 seconds)
```powershell
cd API-Gateway
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:Path = "C:\maven\apache-maven-3.9.6\bin;" + $env:Path
mvn spring-boot:run
```

**3. Start Auth Service**
```powershell
cd Auth-Service
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:Path = "C:\maven\apache-maven-3.9.6\bin;" + $env:Path
mvn spring-boot:run
```

**4. Start Event Service**
```powershell
cd Event-Service
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:Path = "C:\maven\apache-maven-3.9.6\bin;" + $env:Path
mvn spring-boot:run
```

**5. Start Registration Service**
```powershell
cd Registration-Service
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:Path = "C:\maven\apache-maven-3.9.6\bin;" + $env:Path
mvn spring-boot:run
```

**6. Start Ticket Service**
```powershell
cd Ticket-Service
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:Path = "C:\maven\apache-maven-3.9.6\bin;" + $env:Path
mvn spring-boot:run
```

**7. Start Notification Service**
```powershell
cd Notification-Service
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:Path = "C:\maven\apache-maven-3.9.6\bin;" + $env:Path
mvn spring-boot:run
```

### Step 3: Start Frontend

```powershell
# Install dependencies (first time only)
pnpm install

# Start development server
pnpm dev
```

Frontend will be available at: http://localhost:3000

## 💾 Database Access

Each service uses H2 in-memory database. Access H2 Console:

| Service | H2 Console URL | JDBC URL | Username | Password |
|---------|---------------|----------|----------|----------|
| Auth | http://localhost:8081/h2-console | `jdbc:h2:mem:authdb` | `sa` | (empty) |
| Event | http://localhost:8082/h2-console | `jdbc:h2:mem:eventdb` | `sa` | (empty) |
| Registration | http://localhost:8083/h2-console | `jdbc:h2:mem:registrationdb` | `sa` | (empty) |
| Ticket | http://localhost:8084/h2-console | `jdbc:h2:mem:ticketdb` | `sa` | (empty) |
| Notification | http://localhost:8085/h2-console | `jdbc:h2:mem:notificationdb` | `sa` | (empty) |

## 🧪 Testing with Postman

## 🧪 Testing with Postman

### 1. User Registration
**POST** `http://localhost:8081/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Test123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```

💡 **Save the token** for authenticated requests!

---

### 2. User Login
**POST** `http://localhost:8081/api/auth/login`

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Test123"
}
```

---

### 3. Create Event
**POST** `http://localhost:8082/api/events`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {your_token}
```

**Body:**
```json
{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference with industry experts",
  "category": "CONFERENCE",
  "location": "Convention Center, New York",
  "startDate": "2025-12-15T10:00:00",
  "endDate": "2025-12-15T18:00:00",
  "totalTickets": 500,
  "availableTickets": 500,
  "price": 99.99,
  "organizer": "Tech Events Inc",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Important:** Use these exact field names:
- `title` (not `name`)
- `location` (not `venue`)
- `startDate` and `endDate` (not `eventDate`)
- `totalTickets` and `availableTickets` (not `totalSeats`)
- Include `organizer` (required)

---

### 4. Get All Events
**GET** `http://localhost:8082/api/events`

**Headers:**
```
Authorization: Bearer {your_token}
```

---

### 5. Register for Event
**POST** `http://localhost:8083/api/registrations`

**Body:**
```json
{
  "eventId": 1,
  "userId": 1,
  "numberOfTickets": 2
}
```

---

### 6. Generate Ticket
**POST** `http://localhost:8084/api/tickets`

**Body:**
```json
{
  "registrationId": 1,
  "eventId": 1,
  "userId": 1
}
```

**Response includes QR code in base64 format**

---

### 7. Send Notification
**POST** `http://localhost:8085/api/notifications`

**Body:**
```json
{
  "recipientEmail": "john.doe@example.com",
  "title": "Event Registration Confirmation",
  "message": "Your registration for Tech Conference 2025 is confirmed!",
  "type": "REGISTRATION"
}
```

---

### Postman Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:8081`
- `auth_token`: (set automatically after login)
- `user_id`: `1`
- `event_id`: `1`

**Auto-save token script** (Add to Login request Tests tab):
```javascript
var jsonData = pm.response.json();
pm.environment.set("auth_token", jsonData.token);
```

## ✅ Verification Checklist

1. **Eureka Dashboard** - http://localhost:8761
   - Login: `admin` / `admin123`
   - All 5 services should show as UP

2. **Frontend** - http://localhost:3000
   - Homepage loads
   - Can navigate to signup/login
   - Dashboard accessible

3. **H2 Consoles** - Check data in databases
   - Auth Service: http://localhost:8081/h2-console
   - Event Service: http://localhost:8082/h2-console
   - Registration Service: http://localhost:8083/h2-console
   - Ticket Service: http://localhost:8084/h2-console
   - Notification Service: http://localhost:8085/h2-console

4. **API Testing**
   - Register user → Get JWT token
   - Create event → Event appears in database
   - Register for event → Registration created
   - Generate ticket → Ticket with QR code generated

## 🔧 Troubleshooting

### Service won't start
- Check if port is already in use: `netstat -ano | findstr :{port}`
- Kill process: `taskkill /F /PID {process_id}`

### Maven not found
- Verify Maven installation: `mvn -version`
- Set JAVA_HOME and PATH as shown in setup

### Connection refused
- Ensure Eureka Server started first
- Wait 30 seconds after starting Eureka
- Check service logs for errors

### 500 Internal Server Error
- Check terminal logs for stack trace
- Verify request body matches entity fields
- Ensure all required fields are provided

### JWT Token issues
- Token might be expired (24 hours)
- Login again to get new token
- Verify token is included in Authorization header

## 📚 API Documentation

### Base URLs
- **Direct Access**: `http://localhost:{service_port}/api/{endpoint}`
- **Via Gateway**: `http://localhost:8080/api/{endpoint}`

### Authentication
All endpoints except `/api/auth/register` and `/api/auth/login` require JWT token:
```
Authorization: Bearer {your_jwt_token}
```

### Common Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error (check logs)

## 🎯 Use Cases

1. **Event Management System**
   - Organizations can create and manage events
   - Users can browse and search events
   - Category-based filtering

2. **Event Registration**
   - Users register for events
   - Track available seats
   - Manage attendee lists

3. **Ticket Generation**
   - Automated ticket generation with QR codes
   - Digital ticket delivery
   - Ticket validation system

4. **Notifications**
   - Email confirmations for registrations
   - Event reminders
   - Ticket delivery notifications

## 🔐 Security

- JWT-based authentication
- BCrypt password encryption
- Token expiration: 24 hours
- CORS enabled for frontend integration
- H2 console secured (production: disable)

## 🚀 Production Deployment

### Database Migration
Replace H2 with production databases in `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/eventdb
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate  # Use Flyway/Liquibase for migrations
```

### Email Configuration
Update Notification Service `application.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_APP_PASSWORD}
```

### Environment Variables
- `JWT_SECRET` - Secure JWT secret key
- `DB_USERNAME` / `DB_PASSWORD` - Database credentials
- `EMAIL_USERNAME` / `EMAIL_APP_PASSWORD` - SMTP credentials
- `EUREKA_USERNAME` / `EUREKA_PASSWORD` - Eureka credentials

## 📝 Notes

- **H2 Databases**: Data is lost on service restart (in-memory)
- **Service Discovery**: All services auto-register with Eureka
- **Load Balancing**: API Gateway handles load balancing
- **Resilience**: Implement circuit breakers (Resilience4j) for production
- **Monitoring**: Add Spring Boot Actuator endpoints for health checks
- **Logging**: Configure centralized logging (ELK stack)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Check troubleshooting section
- Review service logs in terminal
- Verify all services are registered in Eureka
- Test endpoints with Postman collection
