package in.edu.ssn.hostel.controller;

import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.service.studentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class StudentController {
    @Autowired
    studentService students;
    @PostMapping("/addStudent")
    public void addStudent(@RequestBody Student stud){
        students.addStudent(stud);
    }
    @GetMapping("/getStudent/{studId}")
    public Student getStudent(@PathVariable Integer studId){
        return students.getStudent(studId);
    }

}
