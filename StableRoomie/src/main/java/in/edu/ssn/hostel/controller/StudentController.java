package in.edu.ssn.hostel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
    public ResponseEntity<Student> addStudent(@RequestBody Student stud) {
        Student savedStudent = students.addStudent(stud);
        return ResponseEntity.ok(savedStudent);
    }

    @PostMapping("/getStudents")
    public List<Student> getStudents(@RequestBody filter filters) {
        List<Student> s = students.getStudents(filters);
        return s != null ? s : new java.util.ArrayList<>();
    }
}
