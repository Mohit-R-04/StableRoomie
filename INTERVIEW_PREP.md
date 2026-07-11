# StableRoomie — Comprehensive Interview Preparation Guide

---

## 1. PROJECT OVERVIEW (Elevator Pitch)

**StableRoomie** is a **full-stack hostel room allocation system** for SSN College of Engineering. It uses a **hybrid roommate matching algorithm** combining **Gale-Shapley stable matching** (for students with preferred roommates) and **Louvain community detection** (for the remaining students), along with greedy and KDTree fallback strategies.

### One-liner for interviews:
> "StableRoomie is a full-stack web application that uses Gale-Shapley stable matching for preferred roommate pairs and Louvain community detection for the rest, to optimally assign students to hostel rooms based on lifestyle preferences — built with Spring Boot, Flask (Python), PostgreSQL, and vanilla JavaScript."

### Key Highlights:
- **Microservices architecture**: Spring Boot (Java) for backend + Flask (Python) for algorithm
- **OAuth2/Google SSO** authentication with domain restriction
- **Role-based access** (Admin vs Student)
- **Hybrid Matching Algorithm** — Gale-Shapley for preferred roommates + Louvain community detection for remaining students
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
│  - /allot endpoint — Gale-Shapley + Louvain hybrid algo  │
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

## 5. CORE ALGORITHM — HYBRID MATCHING (GALE-SHAPLEY + LOUVAIN)

### Overview:
The algorithm uses a **hybrid 4-pass approach**:
- **Gale-Shapley style stable matching** handles students who specified preferred roommates
- **Louvain community detection** handles the remaining students by finding natural compatibility clusters
- Greedy and KDTree fallbacks ensure nearly 100% assignment rate

### Pass 1 — Gale-Shapley Style Mutual Preference Matching:
```python
# Students who filled preferred roommates get matched via stable matching logic
# Similar to Gale-Shapley: each student "proposes" to their preferred roommates,
# and only mutual acceptance (both sides listed each other) forms a group
for student in students:
    pref_names = student.get("preferredRoommates", "").split(",")
    # Find C-1 friends who also mutually prefer this student
    # If mutual group of size C found → assign immediately (stable match)
```

This is analogous to **Gale-Shapley** — students who mutually prefer each other form stable pairs/groups. No student in a mutually-preferred group would want to swap, guaranteeing stability for these assignments.

### Pass 2 — Louvain Community Detection (for remaining students):
```python
import networkx as nx
import community as community_louvain

# Build weighted compatibility graph from unassigned students
G = nx.Graph()
for s1, s2 in student_pairs:
    score = compatibility(s1, s2)  # weighted edge
    G.add_edge(s1.studentId, s2.studentId, weight=score)

# Louvain detects natural clusters of compatible students
partition = community_louvain.best_partition(G, weight="weight")
# Communities split into rooms of size C
```

**Louvain** optimizes **modularity** — it finds groups where students are more compatible with each other than with the rest of the graph. Each community is then divided into rooms of size C.

### Why Both Algorithms?
- **Gale-Shapley** (Pass 1): Best for students who **already know** their preferred roommates — produces guaranteed stable matches
- **Louvain** (Pass 2): Best for students who **didn't specify** preferences — discovers latent compatibility clusters from lifestyle data
- Together they handle both **explicit preferences** and **implicit compatibility**

### Pass 3 — Greedy Compatibility Matching:
```python
# For students not caught by community detection
# Greedily match highest-compatibility pairs
while len(remaining) >= C:
    anchor = remaining[0]
    candidates = sorted(compat_graph[anchor], key=lambda x: -x[1])
    # Pick top C-1 compatible unassigned students
```

### Pass 4 — KDTree Nearest-Neighbour (Fallback):
```python
from sklearn.neighbors import KDTree
import numpy as np

# Convert student attributes to numerical vectors
vectors = [[sleep, wake, noise, light, cleanliness, study] for s in students]
tree = KDTree(np.array(vectors))

# For each leftover student, find C-1 nearest neighbours
dist, idxs = tree.query([vectors[i]], k=C)
```

### Compatibility Scoring Function:
```python
def compatibility(s1, s2, students):
    score = 0
    MAX_DIFF = 2

    # Sleep time similarity (weight: 0.4)
    score += max(0, (MAX_DIFF - sleep_diff) / MAX_DIFF) * 0.4

    # Wake time similarity (weight: 0.4)
    score += max(0, (MAX_DIFF - wake_diff) / MAX_DIFF) * 0.4

    # Noise level match: +0.3 if same
    # Light sensitivity match: +0.3 if same
    # Cleanliness match: +0.3 if same, +0.2 if adjacent
    # Study habits match: +0.3 if same, partial for compatible pairs

    # Mutual preference bonus: +1.0 if both prefer each other
    # One-way preference: +0.5
    return score
```

### Complexity:
- **Time**: O(N²) per student group for pairwise scoring + O(E) for Louvain community detection
- **Space**: O(N²) for the compatibility graph adjacency matrix

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

### Q: "Explain the room allocation algorithm."
**A**: We use a **hybrid algorithm** combining two complementary strategies:
1. **Gale-Shapley stable matching**: Students who specified preferred roommates get matched via mutual preference logic — if A lists B and B lists A, they're stably paired. No student would want to swap.
2. **Louvain community detection**: For students without preferred roommates, we build a weighted compatibility graph (NetworkX) and run Louvain modularity optimization to find natural clusters of compatible students, then split each cluster into rooms.
3. **Greedy compatibility**: Students not caught by community detection are greedily matched by highest compatibility score.
4. **KDTree nearest-neighbour**: Last-resort fallback for hard-to-match leftovers.

The key insight: **Gale-Shapley handles explicit preferences** (students who already know who they want), while **Louvain handles implicit compatibility** (discovers hidden compatibility clusters from lifestyle data).

### Q: "Why use both Gale-Shapley and Louvain instead of just one?"
**A**: They solve different problems. Gale-Shapley produces **stable matches** for students with explicit roommate preferences — no one would want to swap. But it doesn't work well for students without preferences. Louvain discovers **latent compatibility clusters** from lifestyle attributes (sleep schedule, study habits, cleanliness, etc.), which naturally map to room groups. Using both ensures we respect student choices AND maximize overall compatibility for everyone else.

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
- Hybrid Matching (Gale-Shapley Stable Matching + Louvain Community Detection)
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
- **Hybrid algorithm**: Gale-Shapley (preferred roommates) + Louvain (remaining) + Greedy + KDTree
- **1 deployment platform**: Azure VM with Docker Compose
- **4 Docker containers**: Spring Boot, Flask, PostgreSQL, Caddy