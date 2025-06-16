package in.edu.ssn.hostel.repo;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import in.edu.ssn.hostel.model.Student;

public interface studentRepo extends JpaRepository<Student, Integer> {

    @Query("SELECT s FROM Student s WHERE "
            + "(:category IS NULL OR CONCAT(s.clg, '+', s.department, '+', CAST(s.year AS string)) = :category) AND "
            + "(:roomType IS NULL OR s.roomType = :roomType) "
            + "ORDER BY s.submittedTime ASC")
    List<Student> findByCategoryAndRoomType(
            @Param("category") String category,
            @Param("roomType") String roomType,
            Pageable pageable);

    @Query("SELECT s FROM Student s WHERE "
            + "(:address IS NULL OR s.address = :address) AND "
            + "(:category IS NULL OR CONCAT(s.clg, '+', s.department, '+', CAST(s.year AS string)) = :category) AND "
            + "(:roomType IS NULL OR s.roomType = :roomType) "
            + "ORDER BY s.submittedTime ASC")
    List<Student> findByAddressAndCategoryAndRoomType(
            @Param("address") String address,
            @Param("category") String category,
            @Param("roomType") String roomType,
            Pageable pageable);
}
