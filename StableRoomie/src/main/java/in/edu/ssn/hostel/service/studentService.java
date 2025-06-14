package in.edu.ssn.hostel.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.repo.studentRepo;

@Service
public class studentService {
    @Autowired
    studentRepo repo;
    public void addStudent(Student stud){
        repo.save(stud);
    }
    public Student getStudent(Integer studId){
        return repo.findById(studId).orElse(null);
    }
}
