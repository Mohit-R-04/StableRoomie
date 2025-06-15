package in.edu.ssn.hostel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.service.studentService;

import java.util.List;

@CrossOrigin
@RestController
public class StudentController {
    @Autowired
    studentService students;
    @PostMapping("/getStudentDetails")
    public ResponseEntity<Student> addStudent(@RequestBody Student stud){
        Student savedStudent = students.addStudent(stud);
        return ResponseEntity.ok(savedStudent);
    }
    @GetMapping("/getStudents")
    public List<Student> getStudents(){
        return students.getStudents();
    }

}
