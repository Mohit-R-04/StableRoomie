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

    public Student addStudent(Student stud) {
        repo.save(stud);
        return stud;
    }

    public Student getStudentByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<Student> getAllStudents() {
        return repo.findAll();
    }

    public java.util.Optional<Student> getStudentById(int id) {
        return repo.findById(id);
    }

    /** Students ordered by preference update time (earliest first). */
    public List<Student> getAllStudentsByUpdatedAtAsc() {
        return repo.findAllByOrderByUpdatedAtAsc();
    }
}
