# 🎯 Quick Start - Event Ticketing Application

## ⚡ TL;DR - Just Run It!

### **Prerequisites:**
1. ✅ Open **Docker Desktop** (must be running!)
2. ✅ Wait for Docker icon to turn **green** in system tray

### **Run the App:**
```powershell
cd "C:\Users\shaar\OneDrive\Desktop\New folder\New folder"
docker-compose up --build
```

### **Access:**
- Frontend: http://localhost:3000
- Eureka: http://localhost:8761 (admin/admin123)

### **Stop:**
Press `Ctrl+C` then:
```powershell
docker-compose down
```

---

## 📊 What's Running?

| Container | Service | Port | Database |
|-----------|---------|------|----------|
| postgres-auth | PostgreSQL | 5432 | authdb |
| postgres-event | PostgreSQL | 5433 | eventdb |
| postgres-registration | PostgreSQL | 5434 | registrationdb |
| postgres-ticket | PostgreSQL | 5435 | ticketdb |
| postgres-notification | PostgreSQL | 5436 | notificationdb |
| eureka | Service Discovery | 8761 | - |
| api-gateway | API Gateway | 8080 | - |
| auth-service | Authentication | 8081 | Uses authdb |
| event-service | Events | 8082 | Uses eventdb |
| registration-service | Registrations | 8083 | Uses registrationdb |
| ticket-service | Tickets | 8084 | Uses ticketdb |
| notification-service | Notifications | 8085 | Uses notificationdb |
| frontend | Next.js UI | 3000 | - |

**Total: 13 containers**

---

## 🔥 Common Commands

```powershell
# Start (foreground with logs)
docker-compose up --build

# Start (background/detached)
docker-compose up -d --build

# Stop (keeps data)
docker-compose down

# Stop and delete all data
docker-compose down -v

# View running containers
docker-compose ps

# View logs (all)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f event-service

# Restart a service
docker-compose restart event-service

# Check Docker is running
docker ps
```

---

## ⏱️ Timing Expectations

### **First Run:**
- Download images: 2-3 minutes
- Build services: 5-8 minutes
- **Total: ~10 minutes**

### **Subsequent Runs:**
- **Total: 2-3 minutes**

### **Signs It's Ready:**
```
eureka              | Started EurekaServerApplication
auth-service        | Started AuthServiceApplication
event-service       | Started EventServiceApplication
frontend            | ready started server on 0.0.0.0:3000
```

---

## ✅ Data Persistence Test

```powershell
# 1. Start app
docker-compose up -d

# 2. Create data (signup, create events, etc.)
# Visit: http://localhost:3000

# 3. Stop app
docker-compose down

# 4. Start again
docker-compose up -d

# 5. Data is still there! ✅
```

---

## 🐛 Troubleshooting

### **Docker Desktop Not Running**
```
Error: open //./pipe/dockerDesktopLinuxEngine
```
**Fix:** Start Docker Desktop app

### **Port in Use**
```
Error: bind: address already in use
```
**Fix:** 
```powershell
netstat -ano | findstr :8082
taskkill /PID <PID> /F
```

### **Service Won't Start**
```powershell
# Clean rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### **Check Service Health**
```powershell
docker inspect postgres-event | Select-String "Health"
```

---

## 🗄️ Database Access

### **Quick Connect (psql)**
```powershell
docker exec -it postgres-event psql -U ticketing_user -d eventdb
```

### **GUI Client (DBeaver/pgAdmin)**
- Host: localhost
- Port: 5432-5436 (see table above)
- User: ticketing_user
- Pass: ticketing_pass

---

## 📚 Full Documentation

- **Complete Setup Guide**: `SETUP_GUIDE.md`
- **PostgreSQL Migration**: `POSTGRESQL_MIGRATION_GUIDE.md`
- **README**: `README.md`

---

## 🎯 Development Workflow

### **Option 1: Full Docker (Recommended)**
```powershell
docker-compose up --build
```
Everything runs in containers. Use this for production-like testing.

### **Option 2: Hybrid (Backend in Docker, Frontend Local)**
```powershell
# Terminal 1: Start backend only
docker-compose up postgres-auth postgres-event postgres-registration postgres-ticket postgres-notification eureka api-gateway auth-service event-service registration-service ticket-service notification-service

# Terminal 2: Run frontend locally
pnpm dev
```
Better for frontend development (hot reload faster).

---

## 💡 Pro Tips

1. **First time?** Run in foreground to see logs: `docker-compose up --build`
2. **Working on code?** Use detached mode: `docker-compose up -d --build`
3. **Need clean slate?** `docker-compose down -v` (deletes all data!)
4. **Check Eureka** to see if services are registered: http://localhost:8761
5. **Frontend not connecting?** Check API Gateway is running: http://localhost:8080

---

## ⚡ Ready? Let's Go!

```powershell
# 1. Start Docker Desktop (manually)
# 2. Wait for green icon
# 3. Run:

docker ps                          # Verify Docker is running
docker-compose up --build          # Start everything

# Wait 5-10 minutes for first build
# Then open: http://localhost:3000

# Enjoy! 🎉
```
