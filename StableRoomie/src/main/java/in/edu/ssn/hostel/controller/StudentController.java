package in.edu.ssn.hostel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.model.filter;
import in.edu.ssn.hostel.service.studentService;

@CrossOrigin
@RestController
public class StudentController {

    @Autowired
    studentService students;

    @PostMapping("/saveStudents")
    public ResponseEntity<?> addStudent(@RequestBody Student stud, @AuthenticationPrincipal OAuth2User principal) {
        if (principal != null) {
            stud.setEmail(principal.getAttribute("email"));
        }
        
        java.util.Optional<in.edu.ssn.hostel.model.Groups> groupOpt = grepo.findGroupByStudentId(stud.getStudentId());
        if (groupOpt.isPresent()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Your preferences are locked because room allotment has already been finalized."));
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

    @PostMapping("/getStudents")
    public List<Student> getStudents(@RequestBody filter filters) {
        List<Student> s = students.getStudents(filters);
        return s != null ? s : new java.util.ArrayList<>();
    }

    @GetMapping("/api/admin/students")
    public List<Student> getAllStudents() {
        return students.getAllStudents();
    }

    @Autowired
    private in.edu.ssn.hostel.repo.groupsRepo grepo;

    @Autowired
    private in.edu.ssn.hostel.repo.roomRepo rrepo;

    @GetMapping("/api/student/allotment")
    public ResponseEntity<?> getStudentAllotment(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String email = principal.getAttribute("email");
        Student stud = students.getStudentByEmail(email);
        if (stud == null) {
            return ResponseEntity.ok(java.util.Map.of("allotted", false, "message", "Please complete your profile."));
        }

        java.util.Optional<in.edu.ssn.hostel.model.Groups> groupOpt = grepo.findGroupByStudentId(stud.getStudentId());
        if (groupOpt.isEmpty()) {
            return ResponseEntity.ok(java.util.Map.of("allotted", false));
        }

        in.edu.ssn.hostel.model.Groups group = groupOpt.get();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("allotted", true);
        response.put("roomId", group.getRoomId());
        
        // Fetch room type name
        String roomType = rrepo.findById(group.getRoomId())
                .map(r -> r.getRoomType())
                .orElse("Shared Room");
        response.put("roomType", roomType);

        // Fetch roommates details
        java.util.List<java.util.Map<String, Object>> roommatesList = new java.util.ArrayList<>();
        Integer[] ids = { group.getStudent1(), group.getStudent2(), group.getStudent3(), group.getStudent4() };
        for (Integer id : ids) {
            if (id != null && id != stud.getStudentId()) {
                students.getStudentById(id).ifPresent(r -> {
                    java.util.Map<String, Object> rMap = new java.util.HashMap<>();
                    rMap.put("name", r.getName());
                    rMap.put("email", r.getEmail());
                    rMap.put("phone", r.getPhone());
                    rMap.put("department", r.getDepartment());
                    rMap.put("year", r.getYear());
                    roommatesList.add(rMap);
                });
            }
        }
        response.put("roommates", roommatesList);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/allotment-stats")
    public ResponseEntity<?> getAllotmentStats() {
        List<Student> allStudents = students.getAllStudents();
        List<in.edu.ssn.hostel.model.Groups> allGroups = grepo.findAll();
        
        java.util.Map<Integer, String> studentToRoomMap = new java.util.HashMap<>();
        for (in.edu.ssn.hostel.model.Groups g : allGroups) {
            String roomInfo = "Room " + g.getRoomId();
            if (g.getStudent1() != null) studentToRoomMap.put(g.getStudent1(), roomInfo);
            if (g.getStudent2() != null) studentToRoomMap.put(g.getStudent2(), roomInfo);
            if (g.getStudent3() != null) studentToRoomMap.put(g.getStudent3(), roomInfo);
            if (g.getStudent4() != null) studentToRoomMap.put(g.getStudent4(), roomInfo);
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
