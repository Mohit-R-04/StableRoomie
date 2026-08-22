package in.edu.ssn.hostel.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.edu.ssn.hostel.model.Student;

@Repository
public interface studentRepo extends JpaRepository<Student, Integer> {

    Student findByEmail(String email);

    List<Student> findAllByOrderByUpdatedAtAsc();
}
