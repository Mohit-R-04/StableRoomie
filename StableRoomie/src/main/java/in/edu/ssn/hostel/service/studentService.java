package in.edu.ssn.hostel.service;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.repo.studentRepo;

@Service
public class studentService {
    @Autowired
    studentRepo repo;
    public Student addStudent(Student stud){
        repo.save(stud);
        return stud;
    }
    public List<Student> getStudents(){
        return repo.findAll();
    }
}
