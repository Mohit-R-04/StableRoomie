package in.edu.ssn.hostel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.service.studentService;

@RestController
public class StudentController {
    @Autowired
    studentService students;
    @PostMapping("/getStudentDetails")
    public void addStudent(@RequestBody Student stud){
        students.addStudent(stud);
    }
    @GetMapping("/getStudent/{studId}")
    public Student getStudent(@PathVariable Integer studId){
        return students.getStudent(studId);
    }

}
