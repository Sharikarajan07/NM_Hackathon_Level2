# Event Ticketing System - Microservices Architecture

Complete event ticketing system with microservices architecture using Spring Boot, Spring Cloud, Next.js, and PostgreSQL.

## 🚀 Quick Start Guide

### Method 1: Docker (Recommended - Fastest Setup)

**Prerequisites:**
- Docker Desktop installed and running
- 8GB RAM available
- Ports 3000, 5050, 5433-5438, 8080-8086, 8761 available

**Start Everything:**
```powershell
# 1. Navigate to project directory
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2"

# 2. Start all services (one command!)
docker-compose up -d

# 3. Wait 60 seconds for all services to start

# 4. Verify services are running
docker-compose ps

# 5. Open frontend in browser
# Navigate to: http://localhost:3000
```

**Access Points:**
- **Frontend**: http://localhost:3000
- **Eureka Dashboard**: http://localhost:8761 (admin/admin123)
- **pgAdmin**: http://localhost:5050 (admin@admin.com/admin)

**Stop Everything:**
```powershell
docker-compose down
```

---

### Method 2: Manual Setup (Development)

**Prerequisites:**
- Java 17+ (JDK)
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+ (or use Docker for databases)
- pnpm

**Step-by-Step:**

**1. Start Databases (Docker recommended for databases only):**
```powershell
# Start only PostgreSQL containers
docker-compose up -d postgres-auth postgres-event postgres-registration postgres-ticket postgres-notification postgres-payment
```

**2. Start Backend Services (in order, each in separate terminal):**

```powershell
# Terminal 1: Eureka Server (wait 30 seconds)
cd Eureka-Server
mvn spring-boot:run

# Terminal 2: API Gateway (wait 20 seconds)
cd API-Gateway
mvn spring-boot:run

# Terminal 3: Auth Service
cd Auth-Service
mvn spring-boot:run

# Terminal 4: Event Service
cd Event-Service
mvn spring-boot:run

# Terminal 5: Registration Service
cd Registration-Service
mvn spring-boot:run

# Terminal 6: Ticket Service
cd Ticket-Service
mvn spring-boot:run

# Terminal 7: Notification Service
cd Notification-Service
mvn spring-boot:run

# Terminal 8: Payment Service
cd Payment-Service
mvn spring-boot:run
```

**3. Start Frontend:**
```powershell
# Terminal 9: Frontend
npm install -g pnpm
pnpm install
pnpm dev
```

**4. Verify:**
- Eureka Dashboard: http://localhost:8761 (all 7 services should be UP)
- Frontend: http://localhost:3000

---

## ✨ Recent Updates & Bug Fixes

### 🔧 Critical Bug Fixes (November 2025)

#### Latest Updates (November 23, 2025)
1. **CORS Duplicate Headers Fixed** - Resolved "Failed to fetch" errors on payment records page
   - **Problem**: Both Payment Service and API Gateway were adding CORS headers
   - **Browser Error**: "multiple values in Access-Control-Allow-Origin header"
   - **Solution**: Removed `@CrossOrigin` annotation from PaymentController
   - **Solution**: Disabled CorsConfig.java in Payment Service (renamed to .bak)
   - **Result**: API Gateway now exclusively handles CORS via GlobalFilter
   - **Impact**: Payment records page now loads successfully without browser blocking

2. **Payment Records UI Enhancement** - Premium themed design matching application style
   - **Gradient Header**: Cyan → Purple → Fuchsia gradient text
   - **Enhanced Summary Cards**: Individual gradient backgrounds with hover effects
   - **Premium Table Design**: Gradient header row with improved readability
   - **Improved Empty State**: Circular gradient icon background
   - **Responsive Layout**: Mobile-friendly card grid
   - **Production Quality**: Matches Events and Dashboard page styling

3. **Event Images Implementation** - Visual enhancement for event listings
   - **Backend Integration**: Event.java already had imageUrl field (optional String)
   - **Frontend Display**: Images now shown on event cards and detail pages
   - **Gradient Overlays**: Dark gradient from bottom for better text readability
   - **Fallback Design**: Beautiful gradient backgrounds when no image provided
   - **Hover Effects**: Smooth zoom animation on image hover
   - **Image Preview**: Live preview in event creation/edit forms

4. **Edit Event Page** - Full CRUD functionality for event management
   - **Dynamic Routing**: `/admin/events/edit/[id]` with Next.js dynamic routes
   - **Pre-populated Forms**: Automatically loads existing event data via API
   - **All Fields Editable**: Title, description, category, location, dates, tickets, price, organizer, image URL
   - **Live Image Preview**: See image changes in real-time when updating URL
   - **Form Validation**: All required fields validated before submission
   - **Available Tickets**: Edit current ticket availability
   - **Gradient Theme**: Matches application design with purple/cyan gradients
   - **API Integration**: Uses existing `eventsApi.update()` method with PUT request

#### Previous Bug Fixes
5. **User Role Persistence** - Fixed role changing from ORGANIZER to USER after logout/login
   - Modified `AuthService.register()` to preserve selected role instead of hardcoding to "USER"
   - Roles now persist correctly across sessions

6. **Authentication Response** - Added user ID to AuthResponse DTO
   - Login/signup now returns user ID for frontend API calls
   - Fixed 500 errors caused by null userId in database

7. **Spring Security Configuration** - Resolved 403 Forbidden errors
   - Changed `SecurityConfig` to `permitAll()` for auth endpoints
   - Auth endpoints now accessible without authentication

8. **Automatic Ticket Generation** - Implemented ticket creation workflow
   - Created `TicketServiceClient` using Spring Cloud Feign
   - Registration Service now automatically generates tickets after event registration
   - Tickets appear in "My Tickets" dashboard immediately
   - Unique ticket numbers: `TKT-XXXXXXXX` format

9. **Event Creation Fix** - Resolved availableTickets null error
   - `EventService.createEvent()` now initializes `availableTickets = totalTickets`
   - Events can be created successfully through UI

10. **Custom Exception Handling** - Enhanced error messages
    - `UserAlreadyExistsException` returns 409 Conflict for duplicate emails
    - `InvalidCredentialsException` returns 401 Unauthorized for wrong credentials
    - `GlobalExceptionHandler` provides user-friendly error responses

11. **Hydration Mismatch Fixes** - Resolved React SSR/CSR errors
    - Added mounted state pattern to prevent localStorage access during SSR
    - Fixed ReferenceError in admin events page (function ordering)

### 🎨 UI/UX Improvements
- **Payment Records Page** - Production-quality themed design with gradients
- **Event Images** - Visual cards with images, gradient overlays, and hover effects
- **Edit Event Form** - Complete event editing with live image preview
- **Modern Navigation Bar** with gradient backgrounds and backdrop blur
- **Role-Based Menu Items** (ORGANIZER sees "Manage Events", "Create Event")
- **User Avatar Dropdown** with name display and logout option
- **Mobile Responsive** hamburger menu
- **Alert Components** for registration errors (duplicate email, invalid credentials)
- **Enhanced Button Visibility** with proper contrast and hover states

### 🐳 Docker Deployment
- **PostgreSQL 16** databases (6 separate databases on ports 5433-5438)
- **pgAdmin 4** for database management (localhost:5050)
- **All services containerized** with health checks
- **Docker Compose** orchestration for easy deployment

## 💻 Technology Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.x** - Application framework
- **Spring Cloud** - Microservices framework
  - Eureka Server - Service discovery
  - API Gateway - Routing and load balancing
  - OpenFeign - Inter-service communication
- **Spring Security** - Authentication and authorization
- **JWT** - Token-based authentication (24-hour expiration)
- **PostgreSQL 16** - Relational database (6 separate databases)
- **Maven** - Dependency management and build tool
- **Docker** - Containerization

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library (50+ components)
- **Radix UI** - Headless UI primitives
- **pnpm** - Fast package manager
- **Docker** - Containerization

### DevOps & Tools
- **Docker Compose** - Multi-container orchestration
- **pgAdmin 4** - Database management GUI
- **Postman** - API testing
- **Git** - Version control

### Architecture Patterns
- **Microservices Architecture** - Independent, scalable services
- **Service Discovery** - Dynamic service registration
- **API Gateway Pattern** - Single entry point for clients
- **Circuit Breaker** - Resilience4j for fault tolerance
- **Centralized CORS** - API Gateway handles all CORS
- **JWT Authentication** - Stateless authentication
- **Role-Based Access Control** - USER and ORGANIZER roles

## 📁 Project Structure

```
NM_Hackathon_Level2/
├── Eureka-Server/          # Service discovery (Port 8761)
├── API-Gateway/            # API routing and CORS (Port 8080)
├── Auth-Service/           # Authentication & JWT (Port 8081)
├── Event-Service/          # Event management (Port 8082)
├── Registration-Service/   # Event registration (Port 8083)
├── Ticket-Service/         # Ticket generation (Port 8084)
├── Notification-Service/   # Email notifications (Port 8085)
├── Payment-Service/        # Payment processing (Port 8086)
├── app/                    # Next.js pages
│   ├── page.tsx           # Homepage
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── events/            # Browse events
│   │   └── [id]/         # Event details
│   ├── dashboard/         # User dashboard
│   ├── payment-records/   # Payment history (themed UI)
│   └── admin/
│       └── events/
│           ├── page.tsx           # Manage events
│           ├── create/page.tsx    # Create event
│           └── edit/[id]/page.tsx # Edit event (NEW)
├── components/             # React components
│   ├── navigation.tsx     # Navigation bar
│   ├── event-grid.tsx     # Event cards with images
│   └── ui/               # shadcn/ui components (50+)
├── lib/
│   ├── api-client.ts      # API service layer
│   └── utils.ts           # Utility functions
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

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

### 8. Payment Service (Port 8086)
Payment processing and transaction management.
- `POST /api/payments` - Process payment
- `GET /api/payments/history/{userId}` - Get payment history
- `GET /api/payments/{id}` - Get payment details
- CORS handled exclusively by API Gateway (no duplicate headers)
- PostgreSQL Database (Port 5438)

### 9. pgAdmin 4 (Port 5050)
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

### Prerequisites
- **Docker Desktop** installed and running
- **Docker Compose** (included with Docker Desktop)
- At least **8GB RAM** available for Docker
- **Ports Available**: 3000, 5050, 5433-5438, 8080-8086, 8761

### Start All Services

```powershell
# Navigate to project directory
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2"

# Start all services (databases, backend, frontend)
docker-compose up -d

# Check service status
docker-compose ps

# View logs for specific service
docker logs auth-service --tail 50
docker logs event-service --tail 50
docker logs frontend --tail 50
```

### Service URLs (Docker)
- **Frontend (Next.js)**: http://localhost:3000
- **Eureka Server**: http://localhost:8761 (admin/admin123)
- **API Gateway**: http://localhost:8080
- **Auth Service**: http://localhost:8081
- **Event Service**: http://localhost:8082
- **Registration Service**: http://localhost:8083
- **Ticket Service**: http://localhost:8084
- **Notification Service**: http://localhost:8085
- **Payment Service**: http://localhost:8086
- **pgAdmin**: http://localhost:5050 (admin@admin.com/admin)

### Rebuild Specific Service

If you make code changes, rebuild the specific service:

```powershell
# Rebuild Backend Service (Java)
cd Event-Service
mvn clean package -DskipTests
docker build -t nm_hackathon_level2-event-service .
docker-compose -f ../docker-compose.yml stop event-service
docker-compose -f ../docker-compose.yml rm -f event-service
docker-compose -f ../docker-compose.yml up -d event-service

# Rebuild Frontend (Next.js)
cd ..
docker-compose stop frontend
docker-compose rm -f frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Stop Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (clears all data)
docker-compose down -v

# Stop specific service
docker-compose stop frontend

# Restart specific service
docker-compose restart auth-service
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

**Important**: Start services in this exact order and wait for each to fully initialize.

**1. Start Eureka Server** (Wait ~30 seconds for full startup)
```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2\Eureka-Server"
mvn spring-boot:run
```

**Verify**: Open http://localhost:8761 - You should see Eureka dashboard

**2. Start API Gateway** (Wait ~20 seconds)
```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2\API-Gateway"
mvn spring-boot:run
```

**Verify**: Check Eureka dashboard - API-GATEWAY should appear

**3. Start Auth Service**
```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2\Auth-Service"
mvn spring-boot:run
```

**Verify**: Check Eureka dashboard - AUTH-SERVICE should appear

**4. Start Event Service**
```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2\Event-Service"
mvn spring-boot:run
```

**Verify**: Check Eureka dashboard - EVENT-SERVICE should appear

**5. Start Registration Service**
```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2\Registration-Service"
mvn spring-boot:run
```

**Verify**: Check Eureka dashboard - REGISTRATION-SERVICE should appear

**6. Start Ticket Service**
```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2\Ticket-Service"
mvn spring-boot:run
```

**Verify**: Check Eureka dashboard - TICKET-SERVICE should appear

**7. Start Notification Service**
```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2\Notification-Service"
mvn spring-boot:run
```

**Verify**: Check Eureka dashboard - NOTIFICATION-SERVICE should appear

**8. Start Payment Service**
```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2\Payment-Service"
mvn spring-boot:run
```

**Verify**: Check Eureka dashboard - PAYMENT-SERVICE should appear

### Step 3: Start Frontend

```powershell
# Open new PowerShell terminal
cd "C:\Users\shaar\OneDrive\Desktop\New folder\NM\NM_Hackathon_Level2"

# Install dependencies (first time only)
npm install -g pnpm
pnpm install

# Start development server
pnpm dev
```

Frontend will be available at: **http://localhost:3000**

**Verify**: Open browser and navigate to http://localhost:3000
- Should see homepage with gradient background
- Navigation bar with Browse Events, Login, Sign Up
- Can browse events, signup, login, and register for events

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
| Payment | localhost | 5438 | paymentdb | postgres | postgres |

**Connect via PowerShell (Example):**
```powershell
# Install PostgreSQL client if needed
# Then connect to Auth database
psql -h localhost -p 5433 -U postgres -d authdb

# View users table
SELECT * FROM users;
```

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

### 8. Get Payment History
**GET** `http://localhost:8086/api/payments/history/{userId}`

**Headers:**
```
Authorization: Bearer {your_token}
```

**Example:**
```
GET http://localhost:8086/api/payments/history/10
```

**Response:**
```json
[
  {
    "id": 1,
    "userId": 10,
    "eventId": 3,
    "amount": 99.99,
    "paymentStatus": "SUCCESS",
    "transactionId": "TXN-ABC123",
    "paymentDate": "2025-11-23T15:30:00",
    "paymentMethod": "CREDIT_CARD"
  }
]
```

**View in UI**: Navigate to http://localhost:3000/payment-records after login

---

### Postman Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:8080`
- `auth_url`: `http://localhost:8081`
- `event_url`: `http://localhost:8082`
- `payment_url`: `http://localhost:8086`
- `auth_token`: (set automatically after login)
- `user_id`: `1`
- `event_id`: `1`

**Auto-save token script** (Add to Login request Tests tab):
```javascript
var jsonData = pm.response.json();
pm.environment.set("auth_token", jsonData.token);
pm.environment.set("user_id", jsonData.id);
```

## ✅ Verification Checklist

### Using Docker:

1. **Eureka Dashboard** - http://localhost:8761
   - Login: `admin` / `admin123`
   - All services should show as UP (green):
     - API-GATEWAY
     - AUTH-SERVICE
     - EVENT-SERVICE
     - REGISTRATION-SERVICE
     - TICKET-SERVICE
     - NOTIFICATION-SERVICE
     - PAYMENT-SERVICE

2. **Frontend** - http://localhost:3000
   - Homepage loads with modern gradient background
   - Navigation bar shows Browse Events, Login, Sign Up
   - Can signup with USER or ORGANIZER role
   - Dashboard shows registered events and tickets
   - **Payment Records** page with themed design
   - **Event Images** display on event cards
   - **Edit Event** page accessible from Manage Events

3. **pgAdmin** - http://localhost:5050
   - Login: admin@admin.com / admin
   - Add all 6 database servers
   - View users, events, registrations, tickets, payments tables

4. **Test CORS Fix**
   - Open browser DevTools (F12) → Network tab
   - Navigate to Payment Records page
   - Verify no CORS errors in console
   - Payment data loads successfully
   - Response headers should have single `Access-Control-Allow-Origin` value

5. **Test Event Images**
   - Go to Browse Events page
   - Events with imageUrl should display images
   - Events without imageUrl show gradient fallback
   - Hover over event cards for zoom animation
   - Click event to see hero image on detail page

6. **Test Edit Event**
   - Login as ORGANIZER
   - Go to Manage Events
   - Click Edit button on any event
   - Form should pre-populate with event data
   - Change imageUrl to see live preview
   - Update event and verify changes saved

7. **Test Role Persistence**
   - Signup as ORGANIZER role
   - Verify "Manage Events" and "Create Event" appear in navigation
   - Logout
   - Login with same credentials
   - Role should still be ORGANIZER (not USER)

8. **Test Ticket Generation**
   - Register for an event
   - Check "My Tickets" in dashboard
   - Tickets should appear immediately with TKT-XXXXXXXX numbers

9. **Check Logs**
   ```powershell
   docker logs auth-service --tail 50
   docker logs event-service --tail 50
   docker logs payment-service --tail 50
   docker logs frontend --tail 50
   ```

### Using Manual Setup:

1. **Verify All Services Running**
   ```powershell
   # Check processes
   netstat -ano | findstr "8761 8080 8081 8082 8083 8084 8085 8086"
   ```
   Should see all ports listening

2. **Eureka Dashboard**
   - Open http://localhost:8761
   - All 7 services should be registered (excluding Eureka itself)

3. **Frontend**
   - Open http://localhost:3000
   - Same tests as Docker version above

4. **API Tests**
   - Use Postman to test all endpoints
   - Verify authentication works
   - Test event creation, registration, ticket generation
   - Test payment history retrieval

## 🔧 Troubleshooting

### Docker Issues

**Services won't start:**
```powershell
# Check container status
docker-compose ps

# View specific service logs
docker logs auth-service --tail 100
docker logs frontend --tail 100

# Restart specific service
docker-compose restart auth-service

# Rebuild specific service
docker-compose up -d --build auth-service

# Rebuild without cache (for frontend after code changes)
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

**Database connection refused:**
```powershell
# Check if PostgreSQL containers are healthy
docker ps | findstr postgres

# Restart database container
docker-compose restart postgres-auth

# Check database logs
docker logs postgres-auth --tail 50
```

**Port already in use:**
```powershell
# Find process using port (example: port 8080)
netstat -ano | findstr :8080

# Kill process (replace PID with actual process ID)
taskkill /F /PID {process_id}
```

**Frontend shows 404 for new pages:**
```powershell
# Hard refresh browser
# Press: Ctrl + Shift + R

# If still not working, rebuild frontend
docker-compose stop frontend
docker-compose rm -f frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Wait for startup
Start-Sleep -Seconds 10
docker logs frontend --tail 20
```

### Application Issues

**CORS errors on Payment Records page:**
- **Fixed!** Payment Service no longer adds CORS headers
- API Gateway exclusively handles CORS
- If still seeing errors:
  ```powershell
  # Rebuild payment service
  docker-compose up -d --build payment-service
  
  # Check CORS headers in response
  curl -H "Origin: http://localhost:3000" http://localhost:8080/api/payments/history/10 -I
  ```

**Event images not displaying:**
- **Fixed!** Frontend now displays images from Event.imageUrl
- Verify event has imageUrl in database
- Check browser console for image load errors
- Fallback gradient shows if imageUrl is null or fails to load

**Edit Event page shows 404:**
- **Fixed!** Edit page created at `/admin/events/edit/[id]`
- If still seeing 404, rebuild frontend:
  ```powershell
  docker-compose build --no-cache frontend
  docker-compose up -d frontend
  ```
- Hard refresh browser: Ctrl + Shift + R

**Role changes after logout:**
- **Fixed!** Auth Service now preserves selected role
- If issue persists, rebuild auth-service: 
  ```powershell
  docker-compose up -d --build auth-service
  ```

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

### Manual Setup Troubleshooting

**Service won't start:**
- Check if port is already in use: `netstat -ano | findstr :{port}`
- Kill process: `taskkill /F /PID {process_id}`
- Verify Eureka is running first
- Check application.yml for correct configuration

**Maven not found:**
- Verify Maven installation: `mvn -version`
- Set JAVA_HOME: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"`
- Add Maven to PATH: `$env:Path += ";C:\maven\apache-maven-3.9.6\bin"`

**Connection refused:**
- Ensure Eureka Server started first
- Wait 30 seconds after starting Eureka
- Check service logs for errors in terminal

**pnpm not found:**
```powershell
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

### Common Error Messages

**"Failed to fetch"**
- **CORS issue** - Fixed in Payment Service
- Check API Gateway is running
- Verify JWT token is valid (not expired)

**"404 Not Found"**
- **Route doesn't exist** - Check URL spelling
- **Docker build needed** - Rebuild frontend for new pages
- **Hard refresh needed** - Press Ctrl + Shift + R

**"401 Unauthorized"**
- JWT token expired or invalid
- Login again to get new token
- Verify Authorization header: `Bearer {token}`

**"500 Internal Server Error"**
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
- **Direct access**: Use mapped ports (5433-5438)
- **Check data**:
  ```powershell
  # Example: View events table
  docker exec postgres-event psql -U postgres -d eventdb -c "SELECT id, title, image_url FROM events;"
  ```

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
- ✅ API Gateway routing with CORS handling
- ✅ JWT authentication with role-based access
- ✅ PostgreSQL persistent storage (6 databases)
- ✅ Automatic ticket generation workflow
- ✅ Custom exception handling (409, 401 responses)
- ✅ Inter-service communication with Feign
- ✅ Docker containerization with health checks
- ✅ Payment processing service
- ✅ **CORS centralized** - API Gateway only (no duplicate headers)

### Frontend
- ✅ Modern Next.js 16 with TypeScript and React 19
- ✅ Role-based navigation (USER vs ORGANIZER)
- ✅ Responsive design with mobile menu
- ✅ User-friendly error alerts
- ✅ Hydration mismatch prevention
- ✅ Avatar dropdown with user info
- ✅ Gradient backgrounds with backdrop blur
- ✅ Event browsing and registration
- ✅ Ticket dashboard
- ✅ **Payment Records** - Themed with gradient design
- ✅ **Event Images** - Display with overlays and fallbacks
- ✅ **Edit Event Page** - Full CRUD with live preview
- ✅ **Production Quality UI** - Consistent theming across all pages

### Recent Fixes (November 23, 2025)
- ✅ **CORS Duplicate Headers** - Payment Service CORS removed
- ✅ **Payment UI Enhancement** - Premium gradient theme
- ✅ **Event Images** - Visual cards with hover effects
- ✅ **Edit Event** - Complete editing with pre-population

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
