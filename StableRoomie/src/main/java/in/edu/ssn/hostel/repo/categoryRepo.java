package in.edu.ssn.hostel.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import in.edu.ssn.hostel.model.Category;

@Repository
public interface categoryRepo extends JpaRepository<Category, Integer> {
}
