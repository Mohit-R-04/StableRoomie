package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.Allotment;
import in.edu.ssn.hostel.model.AllotmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface allotmentRepo extends JpaRepository<Allotment, AllotmentId> {

    @Query("select a from Allotment a where a.id.studentId = :studentId")
    Optional<Allotment> findByStudentId(@Param("studentId") Integer studentId);

    @Query("select a from Allotment a where a.id.groupId = :groupId")
    List<Allotment> findByGroupId(@Param("groupId") Long groupId);

    @Query("select case when count(a) > 0 then true else false end " +
            "from Allotment a where a.id.studentId = :studentId")
    boolean existsByStudentId(@Param("studentId") Integer studentId);
}
