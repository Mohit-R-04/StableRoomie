# Copilot Instructions for StableRoomie

## Project Overview

StableRoomie is a bi-service roommate matching system for SSN College of Engineering:

1. **Java Spring Boot Backend** (`StableRoomie/`) - REST API for student data management and group allotment coordination
2. **Flask Microservice** (`flask-api/`) - ML-based roommate matching algorithm using community detection

The services communicate via HTTP: Flask calls the Java backend to fetch student data, runs matching algorithms, and returns groups for persistence.

## Build, Test, and Run Commands

### Java Backend (StableRoomie/)

**Prerequisites:** Java 17, Maven

**Build:**
```bash
cd StableRoomie
mvn clean package
```

**Run the application:**
```bash
cd StableRoomie
mvn spring-boot:run
```

The application starts on `http://localhost:8080`

**Run tests:**
```bash
cd StableRoomie
mvn test
```

**Run a specific test:**
```bash
cd StableRoomie
mvn test -Dtest=TestClassName
```

**Rebuild after model changes:**
```bash
cd StableRoomie
mvn clean compile
```

### Flask Microservice (flask-api/)

**Prerequisites:** Python 3.8+

**Install dependencies:**
```bash
cd flask-api
pip install -r requirements.txt
```

**Run the application:**
```bash
cd flask-api
python app.py
```

The Flask app runs on `http://localhost:5000` with debug mode enabled by default.

## Architecture & Key Design Patterns

### Java Backend Architecture

**Package Structure:**
- `controller/` - REST endpoints (StudentController, groupsController, roomsController, etc.)
- `model/` - JPA entities with Lombok annotations (@Data, @Entity, @AllArgsConstructor, @NoArgsConstructor)
- `service/` - Business logic layer with @Service annotation and Autowired dependencies
- `repo/` - Spring Data JPA repositories (extends JpaRepository)
- `config/` - Configuration classes (SecurityConfig for OAuth2)

**Design Patterns:**
- **Entity-Controller-Service-Repository (ECSR):** Controllers inject services, services inject repositories
- **Spring Security with OAuth2:** Google OAuth integration in SecurityConfig and CustomOAuth2UserService
- **JPA with Hibernate:** Automatic table generation (`ddl-auto=update`), eager loading with JPQL queries
- **Dependency Injection:** Constructor injection via @Autowired for loose coupling

**Key Entities:**
- `Student` - Contains personal info, preferences (sleep time, study habits, cleanliness, noise level), room requirements
- `Groups` - Holds matched roommate groups
- `Rooms` - Room definitions (type, capacity)
- `Category` - Room categorization

### Flask Microservice Architecture

**Module Structure:**
- `app.py` - Main Flask application with /allot_roommates endpoint
- `model/students.py` - Student data fetching logic
- `service/allot.py` - Core matching algorithm

**Integration Point:**
- The `/allot_roommates` endpoint:
  1. Receives request with optional filters
  2. Calls Java backend `/getStudents` to fetch filtered student list
  3. Runs matching algorithm via `allot.allotment(students)`
  4. Posts results to `/save-groups` endpoint on Java backend
  5. Returns success/failure status

**ML Stack:**
- scikit-learn for machine learning preprocessing
- python-louvain for community detection algorithm
- networkx for graph-based grouping
- scipy and numpy for numerical computation

## Key Conventions

### Java Code Conventions

1. **Entity/Model Files:** Use Lombok annotations to reduce boilerplate
   - `@Data` - Generates getters, setters, equals, hashCode, toString
   - `@Entity` - Marks as JPA entity
   - `@AllArgsConstructor`, `@NoArgsConstructor` - Auto-generated constructors

2. **Controller Naming:** Class names use PascalCase ending with `Controller` (e.g., `StudentController`, `groupsController`)
   - Use `@CrossOrigin` for CORS compatibility with Flask frontend
   - Use `@PostMapping` for data operations
   - Return `ResponseEntity<T>` for consistent HTTP responses

3. **Service Layer:** Services handle business logic and repository calls
   - Inject repositories via `@Autowired`
   - Name services with `Service` suffix
   - Keep controllers thin (minimal logic)

4. **Database:**
   - Column names use snake_case: `student_id`, `sleep_time`, `room_type`
   - Timestamps use `LocalDateTime` with `@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")`
   - Timezone set to Asia/Kolkata in application.properties

5. **JSON Serialization:** Jackson is configured via application.properties
   - Datetime formatting is standardized across all responses

### Flask Code Conventions

1. **Endpoint Naming:** Use snake_case routes (e.g., `/allot_roommates`, `/save-groups`)

2. **Request/Response Handling:**
   - Always check response status code from external APIs
   - Validate JSON parse errors explicitly
   - Return `jsonify()` with descriptive messages and HTTP status codes

3. **Error Handling:** Wrap external API calls in try-except blocks
   - Log response details for debugging
   - Return 400 for client errors, 500 for server errors

4. **CORS:** Enabled via `CORS(app)` to allow requests from any origin

### Shared Conventions

1. **Environment Variables:** Sensitive config via environment variables (never hardcoded)
   - Java: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SPRING_DATASOURCE_*`
   - Database connection URL uses environment variable `DB_URL`
   - Use `.env` file for local development (loaded by spring-dotenv)

2. **Port Coordination:**
   - Java backend: port 8080
   - Flask microservice: port 5000
   - Ensure both are available before running

3. **Cross-Service Communication:**
   - Flask hardcodes Java backend URL as `http://localhost:8080`
   - Both use JSON for request/response payloads
   - Content-Type header always set to "application/json"

## Common Tasks

### Adding a New Student Property

1. Add `@Column` field to `Student.java` entity
2. Update database via `mvn spring-boot:run` (Hibernate handles migration)
3. Update `StudentController` or `studentService` if new filtering needed
4. Update Flask's student model if the field affects matching logic

### Running the Full Stack

1. Start PostgreSQL (ensure `spring.datasource.url` points to running database)
2. Set environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
3. Run Java: `cd StableRoomie && mvn spring-boot:run`
4. In another terminal, run Flask: `cd flask-api && python app.py`
5. Test at `http://localhost:8080` (frontend) and `http://localhost:5000/allot_roommates` (matching API)

### Debugging

- **Java:** Enable DEBUG logging in application.properties (already enabled)
- **Flask:** Debug mode is on by default (`app.run(debug=True)`) - watch console for exceptions
- **API Communication:** Both services log request/response details to console

### Testing Java Components

Before running full tests:
- Ensure PostgreSQL is running and connection properties are valid
- Mock external dependencies (OAuth) in unit tests via Mockito (included in spring-boot-starter-test)
- Use `@DataJpaTest` for repository tests, `@WebMvcTest` for controller tests

## Important Files

- `StableRoomie/pom.xml` - Maven dependencies and build config
- `StableRoomie/src/main/resources/application.properties` - Spring Boot configuration
- `flask-api/requirements.txt` - Python dependencies
- `StableRoomie/src/main/java/in/edu/ssn/hostel/model/` - JPA entities
- `StableRoomie/src/main/java/in/edu/ssn/hostel/service/` - Business logic
- `flask-api/service/allot.py` - Matching algorithm implementation
