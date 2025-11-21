# Event Ticketing System - Microservices Architecture

Complete event ticketing system with microservices architecture using Spring Boot, Spring Cloud, Next.js, and PostgreSQL.

## ✨ Recent Updates & Bug Fixes

### 🔧 Critical Bug Fixes (November 2025)
1. **User Role Persistence** - Fixed role changing from ORGANIZER to USER after logout/login
   - Modified `AuthService.register()` to preserve selected role instead of hardcoding to "USER"
   - Roles now persist correctly across sessions

2. **Authentication Response** - Added user ID to AuthResponse DTO
   - Login/signup now returns user ID for frontend API calls
   - Fixed 500 errors caused by null userId in database

3. **Spring Security Configuration** - Resolved 403 Forbidden errors
   - Changed `SecurityConfig` to `permitAll()` for auth endpoints
   - Auth endpoints now accessible without authentication

4. **Automatic Ticket Generation** - Implemented ticket creation workflow
   - Created `TicketServiceClient` using Spring Cloud Feign
   - Registration Service now automatically generates tickets after event registration
   - Tickets appear in "My Tickets" dashboard immediately
   - Unique ticket numbers: `TKT-XXXXXXXX` format

5. **Event Creation Fix** - Resolved availableTickets null error
   - `EventService.createEvent()` now initializes `availableTickets = totalTickets`
   - Events can be created successfully through UI

6. **Custom Exception Handling** - Enhanced error messages
   - `UserAlreadyExistsException` returns 409 Conflict for duplicate emails
   - `InvalidCredentialsException` returns 401 Unauthorized for wrong credentials
   - `GlobalExceptionHandler` provides user-friendly error responses

7. **Hydration Mismatch Fixes** - Resolved React SSR/CSR errors
   - Added mounted state pattern to prevent localStorage access during SSR
   - Fixed ReferenceError in admin events page (function ordering)

### 🎨 UI/UX Improvements
- **Modern Navigation Bar** with gradient backgrounds and backdrop blur
- **Role-Based Menu Items** (ORGANIZER sees "Manage Events", "Create Event")
- **User Avatar Dropdown** with name display and logout option
- **Mobile Responsive** hamburger menu
- **Alert Components** for registration errors (duplicate email, invalid credentials)
- **Enhanced Button Visibility** with proper contrast and hover states

### 🐳 Docker Deployment
- **PostgreSQL 16** databases (5 separate databases on ports 5433-5437)
- **pgAdmin 4** for database management (localhost:5050)
- **All services containerized** with health checks
- **Docker Compose** orchestration for easy deployment

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
PostgreSQL Databases (5433-5437)
  
All services register with Eureka Server (8761)
Database Management: pgAdmin (5050)
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
- `POST /api/auth/register` - Register new user (supports USER and ORGANIZER roles)
- `POST /api/auth/login` - User login with JWT token
- Returns user ID, token, email, name, and role
- PostgreSQL Database (Port 5433)

### 4. Event Service (Port 8082)
Event creation and management.
- `GET /api/events` - Get all active events
- `GET /api/events/{id}` - Get event details
- `GET /api/events/category/{category}` - Filter by category
- `GET /api/events/search/{keyword}` - Search events
- `POST /api/events` - Create new event (auto-initializes availableTickets)
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Soft delete event
- PostgreSQL Database (Port 5434)

### 5. Registration Service (Port 8083)
Event registration and attendee management.
- `POST /api/registrations` - Register for event (auto-generates tickets via Feign client)
- `GET /api/registrations/user/{userId}` - User's registrations
- `GET /api/registrations/event/{eventId}` - Event registrations
- `DELETE /api/registrations/{id}` - Cancel registration
- Automatic ticket generation with unique TKT-XXXXXXXX numbers
- PostgreSQL Database (Port 5435)

### 6. Ticket Service (Port 8084)
Ticket generation with QR codes.
- `POST /api/tickets` - Generate ticket with QR code
- `GET /api/tickets/user/{userId}` - User's tickets
- `GET /api/tickets/event/{eventId}` - Event tickets
- `POST /api/tickets/{ticketNumber}/validate` - Validate ticket
- Tickets created automatically after registration
- PostgreSQL Database (Port 5436)

### 7. Notification Service (Port 8085)
Email notifications and messaging.
- `POST /api/notifications` - Send notification
- `GET /api/notifications/user/{userId}` - User notifications
- `GET /api/notifications/user/{userId}/unread` - Unread notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- PostgreSQL Database (Port 5437)

### 8. pgAdmin 4 (Port 5050)
Database management and viewing tool.
- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin
- View and query all PostgreSQL databases
- Manage database schemas and data

## 📋 Prerequisites

- **Docker** and **Docker Compose** (recommended for easy deployment)
- **Java 17+** (JDK 17 or higher) - if running without Docker
- **Maven 3.8+** (Apache Maven) - if running without Docker
- **Node.js 18+** (for Next.js frontend)
- **pnpm** (Node package manager)

## 🛠️ Quick Start with Docker (Recommended)

### Start All Backend Services

```powershell
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker logs auth-service --tail 50
docker logs event-service --tail 50
```

### Service URLs (Docker)
- **Eureka Server**: http://localhost:8761 (admin/admin123)
- **API Gateway**: http://localhost:8080
- **Auth Service**: http://localhost:8081
- **Event Service**: http://localhost:8082
- **Registration Service**: http://localhost:8083
- **Ticket Service**: http://localhost:8084
- **Notification Service**: http://localhost:8085
- **pgAdmin**: http://localhost:5050 (admin@admin.com/admin)
- **Frontend**: http://localhost:3000

### Stop Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🛠️ Manual Setup (Without Docker)

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

### Using pgAdmin (Docker)

Access pgAdmin at http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin

**Add Database Servers in pgAdmin:**
1. Click "Add New Server"
2. **General Tab**: Name = "Auth Service"
3. **Connection Tab**:
   - Host: postgres-auth
   - Port: 5432
   - Database: authdb
   - Username: postgres
   - Password: postgres

Repeat for other services:
- Event Service: postgres-event / eventdb
- Registration Service: postgres-registration / registrationdb
- Ticket Service: postgres-ticket / ticketdb
- Notification Service: postgres-notification / notificationdb

### Direct PostgreSQL Connection

| Service | Host | Port | Database | Username | Password |
|---------|------|------|----------|----------|----------|
| Auth | localhost | 5433 | authdb | postgres | postgres |
| Event | localhost | 5434 | eventdb | postgres | postgres |
| Registration | localhost | 5435 | registrationdb | postgres | postgres |
| Ticket | localhost | 5436 | ticketdb | postgres | postgres |
| Notification | localhost | 5437 | notificationdb | postgres | postgres |

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
  "lastName": "Doe",
  "role": "USER"
}
```

**For Organizer Account:**
```json
{
  "email": "organizer@example.com",
  "password": "Test123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "ORGANIZER"
}
```

**Expected Response:**
```json
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```

💡 **Save the token and id** for authenticated requests!

**Important:** Role persists across sessions - signup as ORGANIZER stays ORGANIZER after logout/login

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

**Response:**
- Registration created
- Tickets automatically generated via Feign client
- Ticket numbers: TKT-A1B2C3D4, TKT-E5F6G7H8
- Tickets immediately visible in dashboard

**Check Generated Tickets:**
**GET** `http://localhost:8084/api/tickets/user/1`

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

### Using Docker:

1. **Eureka Dashboard** - http://localhost:8761
   - Login: `admin` / `admin123`
   - All 5 services should show as UP (green)

2. **Frontend** - http://localhost:3000
   - Homepage loads with modern gradient background
   - Navigation bar shows Browse Events, Login, Sign Up
   - Can signup with USER or ORGANIZER role
   - Dashboard shows registered events and tickets

3. **pgAdmin** - http://localhost:5050
   - Login: admin@admin.com / admin
   - Add all 5 database servers
   - View users, events, registrations, tickets tables

4. **Test Role Persistence**
   - Signup as ORGANIZER role
   - Verify "Manage Events" and "Create Event" appear in navigation
   - Logout
   - Login with same credentials
   - Role should still be ORGANIZER (not USER)

5. **Test Ticket Generation**
   - Register for an event
   - Check "My Tickets" in dashboard
   - Tickets should appear immediately with TKT-XXXXXXXX numbers

6. **Check Logs**
   ```powershell
   docker logs auth-service --tail 50
   docker logs event-service --tail 50
   docker logs registration-service --tail 50
   docker logs ticket-service --tail 50
   ```

## 🔧 Troubleshooting

### Docker Issues

**Services won't start:**
```powershell
# Check container status
docker-compose ps

# View specific service logs
docker logs auth-service --tail 100

# Restart specific service
docker-compose restart auth-service

# Rebuild specific service
docker-compose up -d --build auth-service
```

**Database connection refused:**
```powershell
# Check if PostgreSQL containers are healthy
docker ps | findstr postgres

# Restart database container
docker-compose restart postgres-auth
```

**Port already in use:**
```powershell
# Find process using port
netstat -ano | findstr :8080

# Kill process
taskkill /F /PID {process_id}
```

### Application Issues

**Role changes after logout:**
- **Fixed!** Auth Service now preserves selected role
- If issue persists, rebuild auth-service: `docker-compose up -d --build auth-service`

**Tickets not appearing in dashboard:**
- **Fixed!** Registration Service auto-generates tickets via Feign client
- Check logs: `docker logs registration-service --tail 50`
- Verify ticket-service is running: `docker ps | findstr ticket`

**Event creation fails with 500 error:**
- **Fixed!** Event Service now auto-initializes availableTickets
- Ensure all required fields are provided
- Check logs: `docker logs event-service --tail 50`

**403 Forbidden on auth endpoints:**
- **Fixed!** Security config now permits all auth endpoints
- Verify auth-service is running: `docker ps | findstr auth`

**Hydration mismatch errors:**
- **Fixed!** Added mounted state to prevent SSR/CSR mismatch
- Clear browser cache and refresh page

### Service won't start (Manual Setup)
- Check if port is already in use: `netstat -ano | findstr :{port}`
- Kill process: `taskkill /F /PID {process_id}`

### Maven not found (Manual Setup)
- Verify Maven installation: `mvn -version`
- Set JAVA_HOME and PATH as shown in setup

### Connection refused (Manual Setup)
- Ensure Eureka Server started first
- Wait 30 seconds after starting Eureka
- Check service logs for errors

### 500 Internal Server Error
- Check terminal/Docker logs for stack trace
- Verify request body matches entity fields
- Ensure all required fields are provided
- Common fixes already applied:
  - ✅ User ID now included in AuthResponse
  - ✅ Event availableTickets auto-initialized
  - ✅ Registration auto-generates tickets

### JWT Token issues
- Token might be expired (24 hours)
- Login again to get new token
- Verify token is included in Authorization header

### Database Issues
- **Docker**: Databases persist in volumes, survive restarts
- **pgAdmin**: Use container names (postgres-auth, etc.) not localhost
- **Direct access**: Use mapped ports (5433-5437)

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

- **JWT-based authentication** with 24-hour expiration
- **BCrypt password encryption** (strength 10)
- **Role-based access control** (USER, ORGANIZER)
- **Custom exception handling** with proper HTTP status codes
- **CORS enabled** for frontend integration
- **Spring Security** with permitAll() for auth endpoints
- **PostgreSQL** with persistent storage and proper credentials

## 🐳 Docker Configuration

### Services
- **5 PostgreSQL databases** (one per microservice)
- **pgAdmin 4** for database management
- **Eureka Server** for service discovery
- **API Gateway** for routing
- **5 Microservices** (Auth, Event, Registration, Ticket, Notification)

### Volumes
- postgres-auth-data
- postgres-event-data
- postgres-registration-data
- postgres-ticket-data
- postgres-notification-data
- pgadmin-data

### Networks
- app-network (bridge)

### Health Checks
All services include health checks for reliability

## 🚀 Production Deployment

### Database Configuration
Already using PostgreSQL in Docker. For production:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
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

- **PostgreSQL Databases**: Data persists in Docker volumes
- **Service Discovery**: All services auto-register with Eureka
- **Load Balancing**: API Gateway handles load balancing
- **Resilience**: Implement circuit breakers (Resilience4j) for production
- **Monitoring**: Add Spring Boot Actuator endpoints for health checks
- **Logging**: Configure centralized logging (ELK stack)
- **Automatic Ticket Generation**: Registration Service creates tickets via Feign
- **Role Persistence**: User roles correctly preserved across sessions
- **Error Handling**: Custom exceptions with user-friendly messages

## 🎯 Key Features Implemented

### Backend
- ✅ Microservices architecture with Spring Cloud
- ✅ Service discovery via Eureka
- ✅ API Gateway routing
- ✅ JWT authentication with role-based access
- ✅ PostgreSQL persistent storage
- ✅ Automatic ticket generation workflow
- ✅ Custom exception handling (409, 401 responses)
- ✅ Inter-service communication with Feign
- ✅ Docker containerization with health checks

### Frontend
- ✅ Modern Next.js 14 with TypeScript
- ✅ Role-based navigation (USER vs ORGANIZER)
- ✅ Responsive design with mobile menu
- ✅ User-friendly error alerts
- ✅ Hydration mismatch prevention
- ✅ Avatar dropdown with user info
- ✅ Gradient backgrounds with backdrop blur
- ✅ Event browsing and registration
- ✅ Ticket dashboard

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
