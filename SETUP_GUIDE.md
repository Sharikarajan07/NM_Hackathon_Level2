# 🚀 Complete Setup Guide - Event Ticketing Application with PostgreSQL

## ⚠️ Current Status
Docker Desktop is **NOT running**. You need to start it before running the application.

---

## 📋 Prerequisites Checklist

- ✅ **Node.js & pnpm** - Already installed
- ✅ **Docker Desktop** - Installed (version 28.3.2)
- ❌ **Docker Desktop** - NOT running (needs to be started)

---

## 🎯 Step-by-Step Guide

### **Step 1: Start Docker Desktop**

1. **Open Docker Desktop**
   - Press `Windows Key` and search for "Docker Desktop"
   - Click on Docker Desktop to launch it
   - Wait for Docker to start (you'll see the Docker icon in system tray)
   - The icon should turn from orange/yellow to green when ready

2. **Verify Docker is Running**
   ```powershell
   docker ps
   ```
   - If this shows a table (even if empty), Docker is running ✅
   - If you see an error about "pipe", Docker is not running ❌

---

### **Step 2: Remove Old Version Tag (Warning Fix)**

The warning about `version` in docker-compose.yml is harmless, but we can fix it:

```powershell
# This is optional - the file will work either way
```

---

### **Step 3: Build and Start All Services**

Once Docker Desktop is running:

```powershell
# Navigate to project directory (if not already there)
cd "C:\Users\shaar\OneDrive\Desktop\New folder\New folder"

# Build and start all services
docker-compose up --build
```

**What this does:**
1. Downloads PostgreSQL images (first time only)
2. Creates 5 PostgreSQL databases
3. Builds 6 Java microservices (Auth, Event, Registration, Ticket, Notification, API Gateway)
4. Builds Eureka server
5. Builds Next.js frontend
6. Starts everything in the correct order

**Expected output:**
```
[+] Running 13/13
 ✔ Network created
 ✔ Container postgres-auth
 ✔ Container postgres-event
 ✔ Container postgres-registration
 ✔ Container postgres-ticket
 ✔ Container postgres-notification
 ✔ Container eureka
 ✔ Container api-gateway
 ✔ Container auth-service
 ✔ Container event-service
 ✔ Container registration-service
 ✔ Container ticket-service
 ✔ Container notification-service
 ✔ Container frontend
```

---

### **Step 4: Wait for Services to Start**

This will take 5-10 minutes the first time (building Java services).

**Watch the logs** - you'll see:
1. PostgreSQL databases starting
2. Eureka server starting
3. Microservices registering with Eureka
4. Frontend building and starting

**Look for these success messages:**
```
eureka              | Started EurekaServerApplication
postgres-auth       | database system is ready to accept connections
auth-service        | Started AuthServiceApplication
event-service       | Started EventServiceApplication
registration-service| Started RegistrationServiceApplication
ticket-service      | Started TicketServiceApplication
notification-service| Started NotificationServiceApplication
frontend            | ready started server on 0.0.0.0:3000
```

---

### **Step 5: Access Your Application**

Once all services are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application UI |
| **Eureka Dashboard** | http://localhost:8761 | Service registry (user: admin, pass: admin123) |
| **API Gateway** | http://localhost:8080 | Routes to all services |
| **Auth Service** | http://localhost:8081 | Authentication |
| **Event Service** | http://localhost:8082 | Events management |
| **Registration Service** | http://localhost:8083 | Event registrations |
| **Ticket Service** | http://localhost:8084 | Ticket generation |
| **Notification Service** | http://localhost:8085 | Email notifications |

---

### **Step 6: Test the Application**

1. **Open Frontend**: http://localhost:3000
2. **Sign Up**: Create a new account
3. **Login**: Use your credentials
4. **Create Event**: Go to events page and create an event
5. **Register for Event**: Register for the event
6. **View Dashboard**: See your registrations

---

### **Step 7: Verify Data Persistence**

Test that data persists across restarts:

```powershell
# 1. Stop all containers (in the terminal running docker-compose, press Ctrl+C)
# Then run:
docker-compose down

# 2. Start again
docker-compose up

# 3. Check your data is still there!
# - Login with same credentials ✅
# - Events are still there ✅
# - Registrations are still there ✅
```

---

## 🛠️ Alternative: Run in Background (Detached Mode)

If you want to run services in the background:

```powershell
# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f event-service

# Stop all services
docker-compose down
```

---

## 📊 Monitoring & Management

### **Check Running Containers**
```powershell
docker-compose ps
```

### **View Logs**
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f event-service
docker-compose logs -f postgres-event
```

### **Restart a Service**
```powershell
# Restart specific service
docker-compose restart event-service

# Rebuild and restart
docker-compose up -d --build event-service
```

### **Stop All Services**
```powershell
# Stop containers (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

---

## 🗄️ Database Access

### **Option 1: Using psql (Command Line)**

```powershell
# Connect to Event database
docker exec -it postgres-event psql -U ticketing_user -d eventdb

# Inside psql:
\dt                           # List all tables
SELECT * FROM event;          # View all events
\q                            # Quit
```

### **Option 2: Using GUI Client (Recommended)**

Install **DBeaver** (free) or **pgAdmin**:

**Connection Details:**
- **Host**: localhost
- **Port**: 5432 (auth), 5433 (event), 5434 (registration), 5435 (ticket), 5436 (notification)
- **Database**: authdb, eventdb, registrationdb, ticketdb, notificationdb
- **Username**: ticketing_user
- **Password**: ticketing_pass

---

## 🐛 Troubleshooting

### **Problem 1: Docker Desktop Not Running**

**Error:**
```
error during connect: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Solution:**
1. Open Docker Desktop application
2. Wait for it to start (icon turns green)
3. Try `docker ps` again

---

### **Problem 2: Port Already in Use**

**Error:**
```
bind: address already in use
```

**Solution:**
```powershell
# Find what's using the port (e.g., 8082)
netstat -ano | findstr :8082

# Kill the process (replace 1234 with actual PID)
taskkill /PID 1234 /F

# Or change port in docker-compose.yml
```

---

### **Problem 3: Build Failures**

**Error:**
```
ERROR [build 2/4] COPY pom.xml ./
```

**Solution:**
```powershell
# Clean rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

---

### **Problem 4: Database Connection Errors**

**Error in logs:**
```
Connection refused: postgres-event:5432
```

**Solution:**
- Wait longer - databases need time to be "healthy"
- Check database logs: `docker-compose logs postgres-event`
- Restart: `docker-compose restart event-service`

---

### **Problem 5: Services Not Registering with Eureka**

**Solution:**
1. Open Eureka Dashboard: http://localhost:8761
2. Check if services are listed
3. Wait 30-60 seconds for registration
4. Check service logs for errors

---

## 🎯 Quick Commands Reference

```powershell
# Start everything
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop everything
docker-compose down

# View all containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart event-service

# Rebuild a service
docker-compose up -d --build event-service

# Stop and remove all data (clean slate)
docker-compose down -v

# Clean Docker system
docker system prune -a
```

---

## 📝 Important Notes

### **First Time Setup**
- **Time**: 10-15 minutes
- **Downloads**: ~2GB (PostgreSQL images, base images)
- **Build**: All Java services compile from source

### **Subsequent Starts**
- **Time**: 2-3 minutes
- **No downloads** needed
- **Build**: Only if code changed

### **Data Persistence**
- ✅ Data survives `docker-compose down`
- ✅ Data survives `docker-compose restart`
- ❌ Data is lost with `docker-compose down -v` (removes volumes)

---

## 🎊 Success Indicators

**You know everything is working when:**

1. ✅ All 13 containers are running: `docker-compose ps`
2. ✅ Eureka shows all services: http://localhost:8761
3. ✅ Frontend loads: http://localhost:3000
4. ✅ You can create an account
5. ✅ You can login
6. ✅ You can create events
7. ✅ Events persist after restart

---

## 🚀 Ready to Start?

### **Execute These Commands in Order:**

```powershell
# 1. Make sure you're in the project directory
cd "C:\Users\shaar\OneDrive\Desktop\New folder\New folder"

# 2. Start Docker Desktop (manually - search in Windows)

# 3. Wait for Docker to be ready, then verify:
docker ps

# 4. Start the application
docker-compose up --build

# 5. Wait 5-10 minutes for everything to build and start

# 6. Open browser to http://localhost:3000

# 7. Enjoy your persistent, production-ready application! 🎉
```

---

## 📚 Additional Resources

- **PostgreSQL Migration Guide**: See `POSTGRESQL_MIGRATION_GUIDE.md`
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **Next.js Docs**: https://nextjs.org/docs

---

## ❓ Need Help?

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Check specific service: `docker-compose logs event-service`
3. Verify Docker is running: `docker ps`
4. Try clean rebuild: `docker-compose down && docker-compose up --build`

Happy coding! 🚀
