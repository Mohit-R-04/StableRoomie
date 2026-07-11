package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.Groups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface groupsRepo extends JpaRepository<Groups, Long> {
    @Query("SELECT r.roomId FROM Rooms r WHERE r.roomType = :roomParam")
    Optional<Long> findFirstAvailableRoomId(@Param("roomParam") String roomType);

    @Query("SELECT COALESCE(COUNT(g), 0) FROM Groups g WHERE g.roomId = :roomId")
    int countGroupsByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT r.roomId FROM Rooms r WHERE r.roomType = :roomParam")
    List<Long> findRoomsByType(@Param("roomParam") String roomType);

    @Query("SELECT g FROM Groups g WHERE g.student1 = :id OR g.student2 = :id OR g.student3 = :id OR g.student4 = :id")
    Optional<Groups> findGroupByStudentId(@Param("id") Integer studentId);

    List<Groups> findByRunId(Long runId);
}

