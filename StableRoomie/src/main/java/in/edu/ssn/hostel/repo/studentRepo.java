package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface studentRepo extends MongoRepository<Student, Integer>{
}
