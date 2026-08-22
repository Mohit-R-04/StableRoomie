package in.edu.ssn.hostel.repo;

import in.edu.ssn.hostel.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface settingsRepo extends JpaRepository<Settings, Long> {
}
