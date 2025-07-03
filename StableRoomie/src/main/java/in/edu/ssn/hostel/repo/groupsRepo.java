package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.Groups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface groupsRepo extends JpaRepository<Groups, Long> {
    @Query("SELECT r.id FROM Rooms r WHERE r.roomType = :roomParam")
    Optional<Long> findFirstAvailableRoomId(@Param("roomParam") String roomType);
}

