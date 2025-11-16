# PostgreSQL Migration Guide

## ✅ Migration Complete!

Your application has been successfully migrated from H2 in-memory databases to PostgreSQL persistent databases.

## 🎯 What Changed

### **Before (H2 In-Memory)**
- ❌ Data lost on restart
- ❌ Each service had isolated in-memory databases
- ❌ No data persistence
- ❌ Used H2 console for debugging

### **After (PostgreSQL)**
- ✅ **Data persists across restarts**
- ✅ **Stable, production-ready database**
- ✅ **Each service has its own PostgreSQL database**
- ✅ **Data remains intact even if you stop/restart containers**

---

## 📊 Database Configuration

### **Database Ports & Names**

| Service | Database Name | Port | Container Name |
|---------|--------------|------|----------------|
| Auth Service | `authdb` | 5432 | postgres-auth |
| Event Service | `eventdb` | 5433 | postgres-event |
| Registration Service | `registrationdb` | 5434 | postgres-registration |
| Ticket Service | `ticketdb` | 5435 | postgres-ticket |
| Notification Service | `notificationdb` | 5436 | postgres-notification |

### **Database Credentials**
- **Username**: `ticketing_user`
- **Password**: `ticketing_pass`

---

## 🚀 How to Run Your Application

### **1. Start Everything with Docker Compose**

```powershell
# Navigate to project directory
cd "C:\Users\shaar\OneDrive\Desktop\New folder\New folder"

# Stop any existing containers
docker-compose down

# Build and start all services (PostgreSQL + Microservices)
docker-compose up --build
```

### **2. What Happens**

1. **PostgreSQL databases start first** and wait until healthy
2. **Eureka Server starts**
3. **Microservices start** and connect to their respective databases
4. **Frontend starts** last

### **3. Access Your Application**

- **Frontend**: http://localhost:3000
- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8080
- **Event Service**: http://localhost:8082/api/events

---

## 💾 Data Persistence

### **Is My Data Safe Now?**

**YES!** ✅ Your data is now persistent:

- **Login credentials** persist in `authdb` (PostgreSQL)
- **Events** persist in `eventdb` (PostgreSQL)
- **Registrations** persist in `registrationdb` (PostgreSQL)
- **Tickets** persist in `ticketdb` (PostgreSQL)
- **Notifications** persist in `notificationdb` (PostgreSQL)

### **Test Data Persistence**

```powershell
# 1. Start the application
docker-compose up -d

# 2. Create some data (login, create events, etc.)
# Use Postman or the frontend

# 3. Stop the application
docker-compose down

# 4. Start again
docker-compose up -d

# 5. Your data is still there! ✅
```

---

## 🗄️ Database Volumes

Docker volumes are created to persist data:

```yaml
volumes:
  postgres-auth-data:
  postgres-event-data:
  postgres-registration-data:
  postgres-ticket-data:
  postgres-notification-data:
```

### **View Volumes**

```powershell
docker volume ls
```

### **Remove All Data (Clean Slate)**

```powershell
# Stop containers and remove volumes
docker-compose down -v

# This will delete ALL data from all databases
# Use with caution!
```

---

## 🛠️ Database Management

### **Connect to PostgreSQL Directly**

```powershell
# Connect to Auth database
docker exec -it postgres-auth psql -U ticketing_user -d authdb

# Connect to Event database
docker exec -it postgres-event psql -U ticketing_user -d eventdb
```

### **Common PostgreSQL Commands**

```sql
-- List all tables
\dt

-- View table structure
\d table_name

-- View all data in a table
SELECT * FROM table_name;

-- Count records
SELECT COUNT(*) FROM table_name;

-- Exit PostgreSQL
\q
```

### **Using a Database Client**

You can also use GUI tools like:
- **DBeaver** (Free)
- **pgAdmin** (PostgreSQL official)
- **DataGrip** (JetBrains)

**Connection Details (from host machine):**
- Host: `localhost`
- Port: `5432` (auth), `5433` (event), `5434` (registration), etc.
- Database: See table above
- Username: `ticketing_user`
- Password: `ticketing_pass`

---

## 📝 Configuration Changes Made

### **1. docker-compose.yml**
- Added 5 PostgreSQL containers
- Added health checks
- Added database environment variables to each service
- Added Docker volumes for persistence

### **2. application.yml (All Services)**
Changed from:
```yaml
datasource:
  url: jdbc:h2:mem:authdb
  driver-class-name: org.h2.Driver
jpa:
  database-platform: org.hibernate.dialect.H2Dialect
  hibernate:
    ddl-auto: create-drop  # Data lost on restart!
```

To:
```yaml
datasource:
  url: jdbc:postgresql://localhost:5432/authdb
  username: ticketing_user
  password: ticketing_pass
  driver-class-name: org.postgresql.Driver
jpa:
  database-platform: org.hibernate.dialect.PostgreSQLDialect
  hibernate:
    ddl-auto: update  # Tables persist, only updates schema!
```

### **3. pom.xml (All Services)**
Added PostgreSQL driver:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

## ⚙️ Hibernate DDL Settings

### **ddl-auto: update**
- **Creates tables** if they don't exist
- **Updates schema** if entities change
- **Preserves existing data** ✅
- Safe for development and production

### **Other Options (NOT RECOMMENDED)**
- `create`: Drops and recreates tables (data loss!)
- `create-drop`: Creates on start, drops on stop (data loss!)
- `validate`: Only validates schema (no changes)

---

## 🐛 Troubleshooting

### **Services Not Starting**

```powershell
# Check logs
docker-compose logs postgres-auth
docker-compose logs auth-service

# Restart specific service
docker-compose restart auth-service
```

### **Connection Refused Errors**

```powershell
# Ensure PostgreSQL is healthy
docker-compose ps

# Check health status (should be "healthy")
docker inspect postgres-auth | Select-String "Health"
```

### **Port Already in Use**

```powershell
# Check what's using the port
netstat -ano | findstr :5432

# Kill the process (replace PID)
taskkill /PID <process_id> /F
```

### **Clean Rebuild**

```powershell
# Complete cleanup
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```

---

## 📊 Data Migration (If Needed)

If you had existing H2 data you want to keep:

1. **Export from H2** (using H2 console or SQL)
2. **Import to PostgreSQL** using SQL scripts
3. Or use Spring Boot to recreate seed data

---

## 🎉 Summary

### **Your Application NOW:**
- ✅ Uses PostgreSQL for all databases
- ✅ Data persists across restarts
- ✅ Production-ready database setup
- ✅ Each microservice has its own database
- ✅ Docker volumes ensure data safety
- ✅ Ready for deployment

### **To Answer Your Question:**
> **Is login, event, and all other data consistent even if I restart the full application?**

**YES! Absolutely! 🎯**

When you run `docker-compose down` and then `docker-compose up` again:
- All user accounts remain
- All events remain
- All registrations remain
- All tickets remain
- All notifications remain

Your data is now **stable and persistent**!

---

## 🚀 Next Steps

1. **Start the application**: `docker-compose up --build`
2. **Create some test data** (register users, create events)
3. **Stop the application**: `docker-compose down`
4. **Start again**: `docker-compose up`
5. **Verify your data is still there** ✅

Enjoy your production-ready, persistent database setup! 🎊
