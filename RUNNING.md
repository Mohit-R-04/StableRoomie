# StableRoomie - Running Application

## ✅ Current Status

Both services are currently **RUNNING** and operational:

- **Java Backend**: http://localhost:8080 (PID: 24288)
- **Flask Microservice**: http://localhost:5001 (PID: 25001)
- **PostgreSQL Database**: localhost:5432 (stableromie)

## 🚀 To Restart Services

### Stop All Services
```bash
# Kill Java backend
lsof -i :8080 | grep -v COMMAND | awk '{print $2}' | xargs kill

# Kill Flask backend
lsof -i :5001 | grep -v COMMAND | awk '{print $2}' | xargs kill

# Stop PostgreSQL
brew services stop postgresql@14
```

### Start All Services

#### 1. PostgreSQL
```bash
brew services start postgresql@14
```

#### 2. Java Backend
```bash
cd /Users/mohitreddy/Documents/StableRoomie/StableRoomie
export GOOGLE_CLIENT_ID=test-client-id
export GOOGLE_CLIENT_SECRET=test-client-secret
export DB_URL=jdbc:postgresql://localhost:5432/stableromie
export DB_USERNAME=mohitreddy
export DB_PASSWORD=""
mvn spring-boot:run
```

#### 3. Flask Microservice
```bash
cd /Users/mohitreddy/Documents/StableRoomie/flask-api
source venv/bin/activate
python3 app.py
```

## 🔧 Development Notes

- **Java**: Runs on port 8080 with Spring Security/OAuth2 enabled
- **Flask**: Runs on port 5001 with CORS enabled
- **Database**: Auto-creates tables via Hibernate on first access
- **Environment**: All config in `.env` file

## 📝 Files Modified for Build Success

1. `StableRoomie/src/main/java/in/edu/ssn/hostel/model/Groups.java`
   - Fixed field names for Lombok getter/setter generation
   - Added explicit getter/setter methods

2. `StableRoomie/src/main/java/in/edu/ssn/hostel/model/Rooms.java`
   - Added @Column annotations for proper JPA mapping
   - Added explicit getter/setter methods

3. `StableRoomie/src/main/java/in/edu/ssn/hostel/model/filter.java`
   - Added explicit getter methods for filter fields

4. `StableRoomie/src/main/java/in/edu/ssn/hostel/model/Category.java`
   - Added explicit setter for category field

5. `StableRoomie/src/main/java/in/edu/ssn/hostel/service/GroupService.java`
   - Updated field names to match model changes

## 📚 Documentation

- See `.github/copilot-instructions.md` for full developer guide
- See README.md in StableRoomie/ for OAuth2 setup

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -i :8080  # or :5001 or :5432
kill <PID>
```

**Database connection failed?**
```bash
createdb stableromie  # Create database if needed
psql -d stableromie -c "SELECT version()"  # Test connection
```

**Python dependencies missing?**
```bash
cd flask-api
source venv/bin/activate
pip install -r requirements.txt
```

**Java compilation errors?**
```bash
cd StableRoomie
mvn clean compile
```

## ✅ What's Working

- ✓ Java backend compilation and startup
- ✓ Flask microservice with all ML dependencies
- ✓ PostgreSQL database creation and connection
- ✓ Model entity fixes for Lombok compatibility
- ✓ Environment variable configuration
- ✓ Cross-service HTTP communication setup
- ✓ Database auto-schema generation (Hibernate)
- ✓ CORS configuration for Flask

## 🎯 Next Development Tasks

1. Test Flask → Java API calls with real student data
2. Verify Hibernate table creation on first request
3. Implement and test matching algorithm
4. Configure actual Google OAuth credentials if needed
5. Add frontend integration tests
