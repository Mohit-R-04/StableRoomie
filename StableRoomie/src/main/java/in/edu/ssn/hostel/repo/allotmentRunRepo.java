package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.AllotmentRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface allotmentRunRepo extends JpaRepository<AllotmentRun, Long> {
}
