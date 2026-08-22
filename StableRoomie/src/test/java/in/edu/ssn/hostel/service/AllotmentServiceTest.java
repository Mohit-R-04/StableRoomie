package in.edu.ssn.hostel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.InetSocketAddress;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;

import in.edu.ssn.hostel.model.Rooms;
import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.repo.allotmentRepo;
import in.edu.ssn.hostel.repo.groupsRepo;
import in.edu.ssn.hostel.repo.roomRepo;
import in.edu.ssn.hostel.repo.studentRepo;

/**
 * Verifies the Lock & Allot pipeline end to end (preference fill by update
 * time, department-sorted two-phase grouping via the Flask stub, persistence
 * into room_groups + allotment, unallotted reporting, and reset).
 *
 * Runs against Neon, like the application itself: the datasource comes from
 * TEST_DB_URL (see StableRoomie/.env), which must point at a disposable
 * database (e.g. stableromie_test) because every test wipes its tables.
 */
@SpringBootTest(properties = {
        "spring.datasource.url=${TEST_DB_URL}",
        "spring.security.oauth2.client.registration.google.client-id=dummy",
        "spring.security.oauth2.client.registration.google.client-secret=dummy",
        "FLASK_API_URL=http://127.0.0.1:5999"
})
class AllotmentServiceTest {

    @Autowired
    private AllotmentService allotmentService;

    @Autowired
    private roomRepo rrepo;

    @Autowired
    private studentRepo srepo;

    @Autowired
    private groupsRepo grepo;

    @Autowired
    private allotmentRepo arepo;

    @Autowired
    private SettingsService settingsService;

    private static HttpServer flaskStub;

    @BeforeAll
    static void startFlaskStub() throws Exception {
        flaskStub = HttpServer.create(new InetSocketAddress(5999), 0);
        flaskStub.createContext("/allot", exchange -> {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode body = mapper.readTree(exchange.getRequestBody().readAllBytes());
            int capacity = body.get("capacity").asInt();
            JsonNode students = body.get("students");
            StringBuilder out = new StringBuilder("{\"groups\": [");
            int n = students.size();
            for (int i = 0; i < n; i += capacity) {
                if (i > 0) out.append(",");
                out.append("[");
                for (int j = i; j < Math.min(i + capacity, n); j++) {
                    if (j > i) out.append(",");
                    out.append(students.get(j).get("studentId").asInt());
                }
                out.append("]");
            }
            out.append("]}");
            byte[] resp = out.toString().getBytes();
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, resp.length);
            exchange.getResponseBody().write(resp);
            exchange.close();
        });
        flaskStub.start();
    }

    @AfterAll
    static void stopFlaskStub() {
        if (flaskStub != null) flaskStub.stop(0);
    }

    @BeforeEach
    void cleanDb() {
        // Wipes every table in the TEST_DB_URL database before each test —
        // this must never point at the dev/production database.
        arepo.deleteAll();
        grepo.deleteAll();
        srepo.deleteAll();
        rrepo.deleteAll();
        settingsService.setPreferencesOpen(false);
    }

    @Test
    void preferencesWindowDefaultsClosedAndCanToggle() {
        assertFalse(settingsService.arePreferencesOpen(), "window must start closed");
        settingsService.setPreferencesOpen(true);
        assertTrue(settingsService.arePreferencesOpen());
        settingsService.setPreferencesOpen(false);
        assertFalse(settingsService.arePreferencesOpen());
    }

    private void seedRoomsAndStudents() {
        Rooms triple = new Rooms();
        triple.setRoomType("3-Sharing");
        triple.setCapacity(3);
        triple.setTotalRooms(2); // 6 seats
        triple = rrepo.save(triple);

        Rooms double_ = new Rooms();
        double_.setRoomType("2-Sharing");
        double_.setCapacity(2);
        double_.setTotalRooms(1); // 2 seats
        rrepo.save(double_);

        // 6 students preferring 3-Sharing, 2 preferring 2-Sharing,
        // 2 with exhausted prefs -> unallotted.
        for (int i = 1; i <= 6; i++) {
            saveStudent(i, "Student " + i, "CSE", "3-Sharing", "2-Sharing", "");
        }
        saveStudent(7, "Student 7", "IT", "2-Sharing", "3-Sharing", "");
        saveStudent(8, "Student 8", "IT", "2-Sharing", "3-Sharing", "");
        saveStudent(9, "Student 9", "ECE", "3-Sharing", "2-Sharing", "4-Sharing");
        saveStudent(10, "Student 10", "EEE", "3-Sharing", "2-Sharing", "4-Sharing");
    }

    private void saveStudent(int id, String name, String dept, String p1, String p2, String p3) {
        Student s = new Student();
        s.setStudentId(id);
        s.setName(name);
        s.setDepartment(dept);
        s.setYear("2nd");
        s.setClg("SSN College");
        s.setEmail("s" + id + "@ssn.edu.in");
        s.setRoomTypePref1(p1);
        s.setRoomTypePref2(p2);
        s.setRoomTypePref3(p3);
        s.setSleepTime("11:00 PM");
        s.setWakeTime("7:00 AM");
        s.setNoiseLevel("low");
        s.setLightSensitivity("no-light");
        s.setCleanliness("moderately-clean");
        s.setStudyHabits("silent");
        s.setUpdatedAt(LocalDateTime.now().plusMinutes(id));
        srepo.save(s);
    }

    @Test
    void lockAndAllotFillsPreferencesAndReportsUnallotted() {
        seedRoomsAndStudents();
        settingsService.setPreferencesOpen(true); // warden opened the window for submissions
        Map<String, Object> results = allotmentService.lockAndAllot();

        assertEquals(8, ((Number) results.get("allottedCount")).intValue());
        assertEquals(2, ((Number) results.get("unallottedCount")).intValue());
        assertTrue((Boolean) results.get("locked"));
        assertFalse(settingsService.arePreferencesOpen(),
                "finalizing the allotment must close the preference window");
        assertEquals(3, grepo.count(), "two 3-Sharing rooms + one 2-Sharing room");
        assertEquals(8, arepo.count(), "one allotment row per allotted student");

        // every allotment references a distinct student
        assertEquals(8, arepo.findAll().stream().map(a -> a.getStudentId()).distinct().count());

        // rooms per type
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roomTypes = (List<Map<String, Object>>) results.get("roomTypes");
        Map<String, Object> triple = roomTypes.get(0);
        Map<String, Object> double_ = roomTypes.get(1);
        assertEquals("3-Sharing", triple.get("roomType"));
        assertEquals(2, ((Number) triple.get("usedRooms")).intValue());
        assertEquals("2-Sharing", double_.get("roomType"));
        assertEquals(1, ((Number) double_.get("usedRooms")).intValue());

        // unallotted students have no allotment row and are reported
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> unallotted = (List<Map<String, Object>>) results.get("unallotted");
        assertEquals(2, unallotted.size());
        for (Map<String, Object> u : unallotted) {
            assertFalse(arepo.existsByStudentId(((Number) u.get("studentId")).intValue()));
        }
    }

    @Test
    void lockAndAllotRejectsMissingTotalRooms() {
        Rooms triple = new Rooms();
        triple.setRoomType("3-Sharing");
        triple.setCapacity(3);
        triple.setTotalRooms(2);
        rrepo.save(triple);

        Rooms unconfigured = new Rooms();
        unconfigured.setRoomType("2-Sharing");
        unconfigured.setCapacity(2);
        unconfigured.setTotalRooms(0);
        rrepo.save(unconfigured);

        saveStudent(1, "Student 1", "CSE", "3-Sharing", "2-Sharing", "");
        saveStudent(2, "Student 2", "CSE", "3-Sharing", "2-Sharing", "");

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> allotmentService.lockAndAllot());
        assertTrue(ex.getMessage().contains("total number of rooms"));
        assertEquals(0, grepo.count());
    }

    @Test
    void lockAndAllotCannotRunTwiceAndResetUnlocks() {
        seedRoomsAndStudents();
        allotmentService.lockAndAllot();

        assertThrows(IllegalStateException.class, () -> allotmentService.lockAndAllot());

        allotmentService.resetAllotment();
        assertFalse(allotmentService.isLocked());
        assertEquals(0, grepo.count());
        assertEquals(0, arepo.count());

        // can run again after reset
        Map<String, Object> results = allotmentService.lockAndAllot();
        assertEquals(8, ((Number) results.get("allottedCount")).intValue());
        assertTrue((Boolean) results.get("locked"));
    }

    @Test
    void flushAllDataWipesEverythingAndClosesWindow() {
        seedRoomsAndStudents();
        settingsService.setPreferencesOpen(true);
        allotmentService.lockAndAllot();
        assertEquals(3, grepo.count());
        assertEquals(8, arepo.count());

        allotmentService.flushAllData();

        assertEquals(0, grepo.count());
        assertEquals(0, arepo.count());
        assertEquals(0, srepo.count());
        assertEquals(0, rrepo.count());
        assertFalse(settingsService.arePreferencesOpen(), "flush must reset the window to closed");
        assertFalse(allotmentService.isLocked(), "flush must leave the system unlocked");
    }

    @Test
    void lockAndAllotRejectsWhenNoStudents() {
        Rooms triple = new Rooms();
        triple.setRoomType("3-Sharing");
        triple.setCapacity(3);
        triple.setTotalRooms(2);
        rrepo.save(triple);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> allotmentService.lockAndAllot());
        assertTrue(ex.getMessage().contains("No students"));
    }
}
