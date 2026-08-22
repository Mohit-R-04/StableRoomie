package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.Allotment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface allotmentRepo extends JpaRepository<Allotment, Long> {

    Optional<Allotment> findByStudentId(Integer studentId);

    List<Allotment> findByGroupId(Long groupId);

    boolean existsByStudentId(Integer studentId);
}
