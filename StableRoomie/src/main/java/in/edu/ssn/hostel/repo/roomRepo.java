package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.Rooms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface roomRepo extends JpaRepository<Rooms, Integer> {
}
