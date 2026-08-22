package in.edu.ssn.hostel.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import in.edu.ssn.hostel.model.Allotment;
import in.edu.ssn.hostel.model.Groups;
import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.repo.allotmentRepo;
import in.edu.ssn.hostel.repo.groupsRepo;
import in.edu.ssn.hostel.repo.roomRepo;
import in.edu.ssn.hostel.service.AllotmentService;
import in.edu.ssn.hostel.service.studentService;

@CrossOrigin
@RestController
public class StudentController {

    @Autowired
    studentService students;

    @Autowired
    private allotmentRepo arepo;

    @Autowired
    private groupsRepo grepo;

    @Autowired
    private roomRepo rrepo;

    @Autowired
    private AllotmentService allotmentService;

    @Autowired
    private in.edu.ssn.hostel.service.SettingsService settingsService;

    @PostMapping("/saveStudents")
    public ResponseEntity<?> addStudent(@RequestBody Student stud, @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        stud.setEmail(principal.getAttribute("email"));

        if (allotmentService.isLocked() || arepo.existsByStudentId(stud.getStudentId())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Your preferences are locked because room allotment has already been finalized."));
        }

        if (!settingsService.arePreferencesOpen()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Preference selection has not been opened yet by the warden. Please check back later."));
        }

        Student savedStudent = students.addStudent(stud);
        return ResponseEntity.ok(savedStudent);
    }

    @GetMapping("/api/student/profile")
    public ResponseEntity<Student> getStudentProfile(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String email = principal.getAttribute("email");
        Student stud = students.getStudentByEmail(email);
        if (stud == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stud);
    }

    @GetMapping("/api/admin/students")
    public List<Student> getAllStudents() {
        return students.getAllStudents();
    }

    @GetMapping("/api/student/allotment")
    public ResponseEntity<?> getStudentAllotment(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String email = principal.getAttribute("email");
        Student stud = students.getStudentByEmail(email);
        if (stud == null) {
            return ResponseEntity.ok(Map.of("allotted", false, "message", "Please complete your profile.",
                    "locked", allotmentService.isLocked(), "preferencesOpen", settingsService.arePreferencesOpen()));
        }

        java.util.Optional<Allotment> allotmentOpt = arepo.findByStudentId(stud.getStudentId());
        if (allotmentOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("allotted", false, "locked", allotmentService.isLocked(),
                    "preferencesOpen", settingsService.arePreferencesOpen()));
        }

        Allotment allotment = allotmentOpt.get();
        Groups group = grepo.findById(allotment.getGroupId()).orElse(null);
        if (group == null) {
            return ResponseEntity.ok(Map.of("allotted", false, "locked", allotmentService.isLocked(),
                    "preferencesOpen", settingsService.arePreferencesOpen()));
        }

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("allotted", true);
        response.put("locked", allotmentService.isLocked());
        response.put("preferencesOpen", settingsService.arePreferencesOpen());
        response.put("roomId", group.getRoomId());
        response.put("groupId", group.getGroupId());

        String roomType = rrepo.findById(group.getRoomId())
                .map(r -> r.getRoomType())
                .orElse("Shared Room");
        response.put("roomType", roomType);

        List<Map<String, Object>> roommatesList = new java.util.ArrayList<>();
        for (Allotment a : arepo.findByGroupId(group.getGroupId())) {
            if (a.getStudentId() == null || a.getStudentId() == stud.getStudentId()) {
                continue;
            }
            students.getStudentById(a.getStudentId()).ifPresent(r -> {
                Map<String, Object> rMap = new java.util.HashMap<>();
                rMap.put("name", r.getName());
                rMap.put("email", r.getEmail());
                rMap.put("phone", r.getPhone());
                rMap.put("department", r.getDepartment());
                rMap.put("year", r.getYear());
                roommatesList.add(rMap);
            });
        }
        response.put("roommates", roommatesList);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/allotment-stats")
    public ResponseEntity<?> getAllotmentStats() {
        List<Student> allStudents = students.getAllStudents();

        java.util.Map<Integer, String> studentToRoomMap = new java.util.HashMap<>();
        for (Allotment a : arepo.findAll()) {
            if (a.getStudentId() == null) {
                continue;
            }
            grepo.findById(a.getGroupId()).ifPresent(g -> {
                String roomInfo = rrepo.findById(g.getRoomId())
                        .map(r -> r.getRoomType() + " (Room #" + g.getGroupId() + ")")
                        .orElse("Room #" + g.getGroupId());
                studentToRoomMap.put(a.getStudentId(), roomInfo);
            });
        }

        java.util.List<java.util.Map<String, Object>> allottedList = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, Object>> unallottedList = new java.util.ArrayList<>();

        for (Student s : allStudents) {
            java.util.Map<String, Object> sMap = new java.util.HashMap<>();
            sMap.put("studentId", s.getStudentId());
            sMap.put("name", s.getName());
            sMap.put("email", s.getEmail());
            sMap.put("phone", s.getPhone());
            sMap.put("category", s.getClg() + "-" + s.getDepartment() + "-" + s.getYear());
            sMap.put("location", s.getLocation());

            if (studentToRoomMap.containsKey(s.getStudentId())) {
                sMap.put("roomDetails", studentToRoomMap.get(s.getStudentId()));
                allottedList.add(sMap);
            } else {
                unallottedList.add(sMap);
            }
        }

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("allottedCount", allottedList.size());
        stats.put("unallottedCount", unallottedList.size());
        stats.put("allottedStudents", allottedList);
        stats.put("unallottedStudents", unallottedList);

        return ResponseEntity.ok(stats);
    }
}
