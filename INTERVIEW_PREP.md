# StableRoomie — Comprehensive Interview Preparation Guide

---

## 1. PROJECT OVERVIEW (Elevator Pitch)

**StableRoomie** is a **full-stack hostel room allocation system** for SSN College of Engineering. It uses an **AI-inspired roommate matching algorithm** (Gale-Shapley Stable Matching) to assign students to hostel rooms based on lifestyle compatibility preferences.

### One-liner for interviews:
> "StableRoomie is a full-stack web application that uses the Gale-Shapley Stable Matching algorithm to optimally assign students to hostel rooms based on lifestyle preferences like sleep schedule, study habits, cleanliness, and noise tolerance — built with Spring Boot, Flask (Python), PostgreSQL, and vanilla JavaScript."

### Key Highlights:
- **Microservices architecture**: Spring Boot (Java) for backend + Flask (Python) for algorithm
- **OAuth2/Google SSO** authentication with domain restriction
- **Role-based access** (Admin vs Student)
- **Stable Matching Algorithm** — no student would prefer to swap with another (mathematically proven)
- **Deployed** on Azure VM with Docker Compose (Spring Boot, Flask, PostgreSQL, Caddy)
- **Docker** containerized with CI/CD

---

## 2. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                       │
│  - index.html (Thymeleaf template)                       │
│  - allotment.js (Vanilla JS, 1262 lines)                 │
│  - styles.css (Responsive, glassmorphism UI)             │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP
                        ▼
┌─────────────────────────────────────────────────────────┐
│              SPRING BOOT APP (Java 21)                   │
│  - REST Controllers (Student, Category, Room, Group)     │
│  - OAuth2 + Google SSO (SecurityConfig)                  │
│  - JPA/Hibernate (PostgreSQL)                            │
│  - Serves static frontend + API endpoints                │
│  - Port: 8080 → Caddy reverse proxy on :443/:80         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP (RestTemplate)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              FLASK API (Python 3.12)                      │
│  - /allot endpoint — Gale-Shapley algorithm              │
│  - Reads students directly from PostgreSQL               │
│  - Port: 5001                                            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                          │
│  Tables: student, student_groups, category, room,        │
│          allotment_runs                                   │
│  (PostgreSQL 16)                                          │
└─────────────────────────────────────────────────────────┘
```

### Why Two Backend Services?
- **Spring Boot**: Handles web serving, authentication, CRUD operations, admin management
- **Flask**: Dedicated to the computationally intensive matching algorithm (Python is better suited for algorithmic/data science work; uses direct SQL queries for performance)

---

## 3. TECHNOLOGY STACK

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | Vanilla JS, HTML5, CSS3 | Lightweight, no framework overhead; served as static files by Spring Boot |
| **Backend (Main)** | Spring Boot 3.4.1, Java 21 | Enterprise-grade, built-in security/OAuth2, JPA for ORM |
| **Backend (Algorithm)** | Flask, Python 3.12 | Rapid prototyping, direct DB access for algorithm performance |
| **Database** | PostgreSQL 16 | ACID compliance, relational integrity, sequence support |
| **Authentication** | Google OAuth2 (Spring Security) | SSO convenience, domain restriction to @ssn.edu.in |
| **Containerization** | Docker, Docker Compose | Consistent environments, microservice orchestration |
| **Deployment** | Azure VM with Docker Compose (all services) | Single VM hosting all microservices via Docker Compose |
| **PDF Generation** | jsPDF + AutoTable (client-side) | Generate allotment charts without server load |
| **ORM** | Hibernate/JPA | Object-relational mapping, automatic DDL |
| **Build Tool** | Maven (Spring Boot), pip (Flask) | Standard build tools for each ecosystem |

---

## 4. DATABASE DESIGN

### Entity-Relationship Model

#### `student` Table
```sql
student_id (PK, INT)     -- Manual ID, not auto-generated
name (VARCHAR)
clg (VARCHAR)             -- College: "ssn" or "snu"
sleep_time (VARCHAR)      -- e.g., "11:00 PM"
wake_time (VARCHAR)       -- e.g., "7:00 AM"
department (VARCHAR)      -- e.g., "CSE", "ECE"
year (VARCHAR)            -- e.g., "2nd", "3rd"
phone (VARCHAR)
study_time (VARCHAR)      -- e.g., "evening", "night"
room_type (VARCHAR)       -- FK concept to room table
address (TEXT)
emergency_contact (VARCHAR)
preferred_roommates (TEXT)
study_habits (VARCHAR)    -- "silent", "music", "group", "discussion"
cleanliness (VARCHAR)     -- "very-clean", "moderately-clean", "casual"
light_sensitivity (VARCHAR) -- "no-light", "any-light"
noise_level (VARCHAR)     -- "silent", "low", "moderate"
submitted_time (TIMESTAMP)
location (VARCHAR)        -- "chennai" or "non-chennai"
email (VARCHAR, UNIQUE)   -- From Google OAuth
```

#### `student_groups` Table (Allotment Results)
```sql
id (PK, BIGINT, SEQUENCE)
student_1 (INT, nullable)  -- FK to student.student_id
student_2 (INT, nullable)
student_3 (INT, nullable)
student_4 (INT, nullable)
room_id (BIGINT)           -- FK to room table
run_id (BIGINT)            -- FK to allotment_runs table
```

#### `category` Table
```sql
id (PK)
college (VARCHAR)
department (VARCHAR)
year (VARCHAR)
name (VARCHAR)  -- Display name
```

#### `room` Table
```sql
id (PK)
room_type (VARCHAR)  -- e.g., "3-Sharing", "2-Sharing"
capacity (INT)       -- Number of students per room
```

#### `allotment_runs` Table (Audit Trail)
```sql
id (PK, AUTO_INCREMENT)
category (VARCHAR)
location (VARCHAR)
room_type (VARCHAR)
student_count (INT)
timestamp (TIMESTAMP)
```

### Key Design Decisions:
- **Student ID is manually assigned** (not auto-generated) — matches real college IDs
- **Groups table uses nullable Integer columns** — rooms can have 1-4 students
- **Sequence generator** for group IDs (PostgreSQL sequence)
- **Allotment runs** provide an audit trail of every allocation performed

---

## 5. CORE ALGORITHM — GALE-SHAPLEY STABLE MATCHING

### What is Stable Matching?
The **Gale-Shapley algorithm** (1962) solves the "stable marriage problem": given n men and n women each ranking all members of the opposite sex, find a stable matching where no pair would prefer each other over their assigned partners.

### How StableRoomie Adapts It:

#### Problem Transformation:
1. **Each student is both a "proposer" and a "reviewer"** — the algorithm runs twice (forward and reverse) to eliminate proposer bias
2. **Compatibility score replaces preference lists** — computed from lifestyle attributes
3. **Room capacity > 2** — rooms hold 2-4 students, requiring group formation

#### Compatibility Scoring Function:
```python
def calculate_score(A, B):
    score = 0
    
    # Sleep time difference (0-25 points)
    score += 25 * (1 - abs(sleep_A - sleep_B) / 6)
    
    # Wake time difference (0-25 points)
    score += 25 * (1 - abs(wake_A - wake_B) / 6)
    
    # Study habits match (0-15 points)
    if study_A == study_B: score += 15
    elif compatible_pair: score += 7  # e.g., "silent" ↔ "music"
    
    # Cleanliness match (0-15 points)
    if clean_A == clean_B: score += 15
    elif adjacent_levels: score += 7  # e.g., "very-clean" ↔ "moderately-clean"
    
    # Noise level (0-10 points)
    if noise_A == noise_B: score += 10
    elif compatible_pair: score += 5
    
    # Light sensitivity (0-10 points)
    if light_A == light_B: score += 10
    
    return score  # Max: 100
```

#### The Algorithm Steps:
```
1. Group students by: location + college + department + year
2. For each group:
   a. Fetch available rooms for the requested room type
   b. Compute pairwise compatibility scores (N×N matrix)
   c. Build ranked preference lists (each student ranks all others)
   d. Run Gale-Shapley Forward (students propose to preferred roommates)
   e. Run Gale-Shapley Reverse (swaps proposer/reviewer roles)
   f. Average both results to eliminate bias
   g. Convert matched pairs → room assignments
   h. Save to DB via direct SQL (bypasses ORM for performance)
   i. Record in allotment_runs (audit trail)
3. Return all grouped students with room assignments
```

#### Key Innovation — Bidirectional Matching:
```python
engagements_fwd = gale_shapley(preference_lists, room_capacity, N)
engagements_rev = gale_shapley(reversed_preference_lists, room_capacity, N)

# Average: student gets best room assignment from both runs
for sid in all_student_ids:
    room = average(engagements_fwd[sid], engagements_rev[sid])
```

This eliminates the **proposer advantage** inherent in classical Gale-Shapley.

#### Complexity:
- **Time**: O(N²) per student group for pairwise scoring + O(N²) for Gale-Shapley
- **Space**: O(N²) for the compatibility matrix and preference lists

---

## 6. SPRING BOOT BACKEND DETAILS

### Layered Architecture:
```
Controller → Service → Repository → Database
    ↓           ↓          ↓
  REST API   Business    JPA/Hibernate
              Logic      (PostgreSQL)
```

### Key Controllers:

#### `StudentController`
- `POST /saveStudents` — Save student preferences (checks if already allotted → locks)
- `GET /api/student/profile` — Get logged-in student's profile (OAuth2)
- `POST /getStudents` — Get filtered student list
- `GET /api/student/allotment` — Get student's room assignment + roommates
- `GET /api/admin/allotment-stats` — Admin: allotted vs unallotted counts
- `GET /api/admin/students` — Admin: all students

#### `groupsController`
- `POST /save-groups` — Save allotment groups (called by Flask API callback)
- `GET /api/admin/allotment-history` — All allotment runs
- `GET /api/admin/allotment-run/{id}/groups` — Groups for a specific run
- `DELETE /api/admin/allotment-run/{id}` — Undo an allotment run

#### `categoryController` — CRUD for student categories
#### `roomsController` — CRUD for room types
#### `DashboardController` — Serves main page, user info, process page

### Security Configuration:
```java
// SecurityConfig.java
- CSRF disabled (for OAuth2 flow)
- PermitAll: /, /login, /api/user-info, static assets
- All other requests: authenticated
- OAuth2 login with Google
- Custom OAuth2UserService for role assignment
- Logout: invalidate session, clear auth, delete JSESSIONID
```

### Custom OAuth2 User Service:
```java
// CustomOAuth2UserService.java
- Delegates to DefaultOAuth2UserService
- Checks email is not null
- Hardcoded ADMIN_EMAIL → role = "ADMIN"
- All others → role = "STUDENT"
- Injects "role" attribute into OAuth2User
```

### Cross-Service Communication:
```java
// DashboardController.java
// Spring Boot calls Flask API using RestTemplate
String flaskApiUrl = "http://flask-api:5001/allot";
HttpEntity<AllotmentRequest> request = new HttpEntity<>(allotReq);
ResponseEntity<String> response = restTemplate.postForEntity(flaskApiUrl, request, String.class);
```

---

## 7. FRONTEND DETAILS

### Architecture:
- **Single HTML page** (index.html) with SPA-like navigation
- **Vanilla JavaScript** — no frameworks (React, Angular, etc.)
- **CSS**: Custom design system with glassmorphism, responsive layout
- **jsPDF + AutoTable**: Client-side PDF generation

### Key Frontend Features:

#### Role-Based UI:
```javascript
// On page load, fetches /api/user-info to determine role
if (role === "ADMIN") {
    show admin-only sections (categories, rooms, tracking, allotment)
} else {
    show student-only sections (dashboard, form)
}
```

#### Single-Page Navigation:
```javascript
function switchSection(sectionId, clickedLink) {
    // Hide all sections, show target section
    // Update active nav link
    // Trigger data loading for the section
}
```

#### Department Loading:
- Departments are fetched from `/api/categories` and populate dropdowns
- Departments are categorized under colleges (SSN, SNU)

#### Student Preference Form:
- 20+ fields covering lifestyle, academics, and personal info
- Auto-loads existing profile if student has already submitted
- Validates required fields before submission
- On save: `POST /saveStudents` → locks if already allotted

#### Admin Allotment Flow:
1. Admin selects: Location → Category → Room Type → Student Count
2. Clicks "Allot Rooms"
3. JS calls `POST /allot` (which proxies to Flask API)
4. Results displayed in table format
5. PDF download available via jsPDF

#### PDF Generation:
```javascript
function downloadPDF() {
    // Creates jsPDF document
    // Navy blue header banner
    // Metadata (date, category, room type, location)
    // AutoTable with group assignments
    // Saves as: allotment_chart_{category}_{roomType}.pdf
}
```

---

## 8. DEPLOYMENT ARCHITECTURE

### Production Setup:

```
┌────────────────────────────────────────────────────┐
│                   AZURE VM                          │
│                                                     │
│  ┌──────────────┐    ┌───────────────────────────┐ │
│  │   Caddy      │    │   Spring Boot App         │ │
│  │   :443/:80   │───▶│   :8080                   │ │
│  │   (HTTPS     │    │   (Auto-renewing TLS)     │ │
│  │   auto-TLS)  │    │                            │ │
│  └──────────────┘    └───────────────────────────┘ │
└────────────────────────────────────────────────────┘

(all services run on Azure VM via Docker Compose)
```

### Docker Configuration:

#### Spring Boot Dockerfile:
```dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN apt-get update && apt-get install -y maven
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Flask Dockerfile:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

### Docker Compose (Local Development):
```yaml
services:
  roomie-db:
    image: postgres:16
    environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
    ports: 5432:5432
    volumes: postgres_data:/var/lib/postgresql/data
    healthcheck: pg_isready

  roomie-spring:
    build: ./StableRoomie
    depends_on: roomie-db (healthy)
    environment: SPRING_DATASOURCE_URL, GOOGLE_CLIENT_ID/SECRET
    ports: 8080:8080

  roomie-flask:
    build: ./flask-api
    depends_on: roomie-db
    environment: DATABASE_URL
    ports: 5001:5001
```

### Caddy Web Server:
```
// Caddyfile
cloudb.site {
    reverse_proxy localhost:8080
    tls mohit.official04091k@gmail.com
}
```
- **Automatic HTTPS** with Let's Encrypt
- **Reverse proxy** to Spring Boot on port 8080
- **Auto-renewal** of TLS certificates


---

## 9. KEY INTERVIEW QUESTIONS & ANSWERS

### Q: "Why did you use two separate backends instead of one?"
**A**: Separation of concerns. Spring Boot handles web serving, authentication, and CRUD — things Java/Spring excels at with built-in security. The matching algorithm is computationally intensive and benefits from Python's direct database access (raw SQL via psycopg2) for performance. This also allows independent scaling and deployment.

### Q: "Explain the Gale-Shapley algorithm and how you adapted it."
**A**: Classical Gale-Shapley solves stable marriage by having one side propose and the other accept/reject. We adapted it for roommate matching by:
1. Using compatibility scores (0-100) instead of explicit preference lists
2. Running it **bidirectionally** (forward + reverse) to eliminate proposer bias
3. Supporting **room capacity > 2** by sequentially filling rooms with matched students
4. Matching within **constrained groups** (same college, department, year, location)

### Q: "Why is the matching 'stable'?"
**A**: A matching is stable when no two students would both prefer to be roommates over their current assignments. Gale-Shapley guarantees this mathematically. In our case, "preference" is quantified by compatibility score. The bidirectional averaging ensures neither the proposer nor reviewer has an inherent advantage.

### Q: "How does authentication work?"
**A**: Google OAuth2 via Spring Security. The flow:
1. User clicks "Continue with Google" → redirected to `/oauth2/authorization/google`
2. Google authenticates → callback to Spring Boot
3. `CustomOAuth2UserService` validates email, assigns role (ADMIN/STUDENT)
4. Session created with JSESSIONID cookie
5. `@AuthenticationPrincipal OAuth2User` injects user info into controllers

### Q: "How do you prevent race conditions during allotment?"
**A**: 
- When a student is allotted, a `Groups` record is created
- `saveStudents` endpoint checks `grepo.findGroupByStudentId()` — if student is already in a group, submission is rejected with HTTP 400
- Allotment history with undo capability prevents data loss

### Q: "Explain your database strategy for the allotment."
**A**: Direct SQL queries from Flask bypass JPA/Hibernate for performance:
```python
cursor.execute("DELETE FROM student_groups WHERE run_id = %s", (run_id,))
cursor.executemany("INSERT INTO student_groups (...) VALUES (...)", inserts)
connection.commit()
```
Spring Boot uses JPA for all other CRUD. This hybrid approach gives us ORM convenience for standard operations and raw performance for bulk allotment writes.

### Q: "How would you scale this system?"
**A**:
1. **Database**: Connection pooling (HikariCP in Spring Boot), read replicas
2. **Algorithm**: Partition students into independent groups → parallel processing
3. **Frontend**: CDN for static assets, lazy loading
4. **Backend**: Horizontal scaling with load balancer (Spring Boot is stateless)
5. **Caching**: Redis for session storage, cached category/room lists
6. **Message Queue**: RabbitMQ/Kafka for async allotment processing

### Q: "What would you improve?"
**A**:
1. **Replace hardcoded admin emails** with a database-driven role table
2. **Add unit tests** for the algorithm and API endpoints
3. **Implement proper CI/CD** (GitHub Actions)
4. **Add monitoring** (Prometheus + Grafana)
5. **Use a proper SPA framework** (React/Vue) for better state management
6. **Add WebSocket** for real-time allotment status updates
7. **Implement rate limiting** to prevent API abuse
8. **Add database migrations** (Flyway/Liquibase)

---

## 10. DESIGN PATTERNS USED

| Pattern | Where | Why |
|---------|-------|-----|
| **Repository Pattern** | `studentRepo`, `groupsRepo`, etc. | Abstraction over data access layer |
| **Service Layer Pattern** | `studentService`, `GroupService`, etc. | Business logic separation from controllers |
| **MVC Pattern** | Overall architecture | Clean separation of concerns |
| **Strategy Pattern** | Algorithm swappable (Flask endpoint URL configurable) | Can replace algorithm without changing Spring Boot |
| **Proxy Pattern** | Spring Boot acts as proxy to Flask API | Single entry point for frontend |
| **Template Method** | `DefaultOAuth2UserService` extended by `CustomOAuth2UserService` | Customize OAuth2 flow |
| **DTO Pattern** | `AllotmentRequest`, `filter` | Data transfer between layers |
| **Builder Pattern** | Spring Security DSL (`http.csrf().authorizeHttpRequests()...`) | Fluent API configuration |

---

## 11. API ENDPOINT SUMMARY

### Public Endpoints:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Landing page |
| GET | `/login` | Login page |
| POST | `/saveStudents` | Save student preferences |
| POST | `/getStudents` | Get filtered students |
| POST | `/save-groups` | Save allotment groups (from Flask) |

### Authenticated Endpoints:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user-info` | Current user info (role, email) |
| GET | `/api/student/profile` | Student's own profile |
| GET | `/api/student/allotment` | Student's room assignment |
| GET | `/process` | Post-login processing page |

### Admin Endpoints:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/students` | All students list |
| GET | `/api/admin/allotment-stats` | Allotted/unallotted statistics |
| GET | `/api/admin/allotment-history` | All allotment runs |
| GET | `/api/admin/allotment-run/{id}/groups` | Groups for a run |
| DELETE | `/api/admin/allotment-run/{id}` | Undo allotment run |
| GET/POST | `/api/categories` | CRUD categories |
| GET/POST | `/room-details` | CRUD room types |

### Flask API:
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/allot` | Run allotment algorithm |

---

## 12. TECHNOLOGIES TO MENTION IN INTERVIEW

### Backend:
- Java 21, Spring Boot 3.4.1, Spring Security, OAuth2
- JPA/Hibernate, PostgreSQL
- RestTemplate (inter-service communication)
- Lombok (boilerplate reduction)
- Python 3.12, Flask, psycopg2

### Frontend:
- Vanilla JavaScript (ES6+, async/await, Fetch API)
- HTML5, CSS3 (Flexbox, Grid, CSS Variables, glassmorphism)
- jsPDF + AutoTable (client-side PDF generation)
- Responsive design (mobile drawer sidebar)

### DevOps:
- Docker, Docker Compose (multi-container orchestration)
- Azure VM (Caddy web server with auto-TLS)
- Git, GitHub

### Concepts:
- Gale-Shapley Stable Matching Algorithm
- Microservices Architecture
- OAuth2 / OpenID Connect
- RESTful API Design
- ORM (JPA/Hibernate)
- Role-Based Access Control (RBAC)
- Responsive Web Design
- Client-Side PDF Generation

---

## 13. NUMBERS TO REMEMBER

- **1,262 lines** of JavaScript (allotment.js)
- **665 lines** of HTML (index.html)
- **150+ lines** of CSS (styles.css)
- **5 database tables** (student, student_groups, category, room, allotment_runs)
- **~15 REST API endpoints** across both backends
- **6 compatibility dimensions** (sleep, wake, study habits, cleanliness, noise, light)
- **Maximum compatibility score**: 100 points
- **Algorithm complexity**: O(N²) per student group
- **Bidirectional matching**: Runs Gale-Shapley twice (forward + reverse) to eliminate bias
- **1 deployment platform**: Azure VM with Docker Compose
- **4 Docker containers**: Spring Boot, Flask, PostgreSQL, Caddy
