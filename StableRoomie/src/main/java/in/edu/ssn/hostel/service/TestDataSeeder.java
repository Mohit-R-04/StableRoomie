package in.edu.ssn.hostel.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.repo.studentRepo;

/**
 * Seeds 200 deterministic test students on an empty student table so the
 * warden can exercise the Lock & Allot flow without real registrations.
 *
 * Disable with {@code app.seed-test-students=false} (or env
 * {@code SEED_TEST_STUDENTS=false}). Existing data is never touched.
 */
@Component
@Lazy(false)
public class TestDataSeeder {

    @Autowired
    private studentRepo srepo;

    @Value("${app.seed-test-students:true}")
    private boolean seedTestStudents;

    private static final String[] FIRST_NAMES = {
            "Aarav", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Mohit", "Nandini",
            "Pranav", "Riya", "Sahil", "Tanvi", "Vikram", "Yash", "Zara", "Aditi",
            "Karthik", "Meera", "Nikhil", "Priya", "Rahul", "Shreya", "Varun", "Aisha"
    };

    private static final String[] LAST_NAMES = {
            "Sharma", "Patel", "Reddy", "Iyer", "Nair", "Gupta", "Singh", "Kumar",
            "Menon", "Rao", "Das", "Chopra", "Verma", "Joshi", "Pillai", "Kapoor",
            "Desai", "Mehta", "Srinivasan", "Bose", "Ghosh", "Agarwal", "Shetty", "Kulkarni"
    };

    private static final String[] DEPARTMENTS = {"CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"};
    private static final String[] YEARS = {"1st", "2nd", "3rd", "4th"};
    private static final String[] SLEEP_TIMES = {"10:00 PM", "11:00 PM", "12:00 AM", "1:00 AM", "9:00 PM"};
    private static final String[] WAKE_TIMES = {"6:00 AM", "7:00 AM", "8:00 AM", "5:00 AM", "9:00 AM"};
    private static final String[] STUDY_TIMES = {"evening", "morning", "night", "early-morning"};
    private static final String[] STUDY_HABITS = {"silent", "music", "group", "discussion"};
    private static final String[] CLEANLINESS = {"moderately-clean", "very-clean", "casual"};
    private static final String[] LIGHT_SENSITIVITY = {"no-light", "any-light"};
    private static final String[] NOISE_LEVEL = {"low", "silent", "moderate"};
    private static final String[][] PREF_PATTERNS = {
            {"3-Sharing", "2-Sharing", "4-Sharing"},
            {"3-Sharing", "2-Sharing", "4-Sharing"},
            {"3-Sharing", "2-Sharing", "4-Sharing"},
            {"2-Sharing", "3-Sharing", "4-Sharing"},
            {"2-Sharing", "3-Sharing", "4-Sharing"},
            {"3-Sharing", "4-Sharing", "2-Sharing"},
            {"4-Sharing", "3-Sharing", "2-Sharing"},
    };

    @jakarta.annotation.PostConstruct
    public void seed() {
        if (!seedTestStudents) {
            return;
        }
        if (srepo.count() > 0) {
            return;
        }

        LocalDateTime base = LocalDateTime.of(2026, 8, 18, 9, 0);
        List<Student> students = new ArrayList<>(200);

        for (int i = 1; i <= 200; i++) {
            int sid = 1000 + i;
            Student s = new Student();
            s.setStudentId(sid);
            s.setName("Student " + sid); // unique names keep roommate-preference resolution unambiguous
            s.setClg(i % 8 == 0 ? "Shiv Nadar University" : "SSN College");
            s.setDepartment(DEPARTMENTS[i % DEPARTMENTS.length]);
            s.setYear(YEARS[i % YEARS.length]);
            s.setPhone("9" + String.format("%09d", 700000000 + i));
            s.setEmail("test" + sid + "@ssn.edu.in");
            s.setSleepTime(SLEEP_TIMES[i % SLEEP_TIMES.length]);
            s.setWakeTime(WAKE_TIMES[(i + 2) % WAKE_TIMES.length]);
            s.setStudyTime(STUDY_TIMES[i % STUDY_TIMES.length]);
            s.setStudyHabits(STUDY_HABITS[i % STUDY_HABITS.length]);
            s.setCleanliness(CLEANLINESS[i % CLEANLINESS.length]);
            s.setLightSensitivity(LIGHT_SENSITIVITY[i % LIGHT_SENSITIVITY.length]);
            s.setNoiseLevel(NOISE_LEVEL[i % NOISE_LEVEL.length]);
            s.setLocation(i % 3 == 0 ? "non-chennai" : "chennai");
            s.setAddress("Street " + (i % 90 + 1) + ", Area " + (char) ('A' + i % 6) + ", Chennai");
            s.setEmergencyContact("98765" + String.format("%05d", i));
            s.setRoomTypePref1(PREF_PATTERNS[i % PREF_PATTERNS.length][0]);
            s.setRoomTypePref2(PREF_PATTERNS[i % PREF_PATTERNS.length][1]);
            s.setRoomTypePref3(PREF_PATTERNS[i % PREF_PATTERNS.length][2]);
            // Every 9th student has a reciprocal roommate preference pair,
            // exercising Pass 1 (mutual preferences) of the algorithm.
            if (i % 9 == 0) {
                s.setPreferredRoommates("Student " + (sid + 1));
            }
            s.setCreatedAt(base.plusMinutes(i * 6));
            s.setUpdatedAt(base.plusMinutes(i * 6));
            students.add(s);
        }

        // Make the roommate preference pairs reciprocal.
        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).getPreferredRoommates() != null && i + 1 < students.size()) {
                students.get(i + 1).setPreferredRoommates(students.get(i).getName());
            }
        }

        srepo.saveAll(students);
        System.out.println("[TestDataSeeder] Seeded 200 test students (IDs 1001-1200).");
    }
}
