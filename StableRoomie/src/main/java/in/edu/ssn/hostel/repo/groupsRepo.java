package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.Groups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface groupsRepo extends JpaRepository<Groups, Long> {

    List<Groups> findByRoomId(Long roomId);

    long countByRoomId(Long roomId);
}
