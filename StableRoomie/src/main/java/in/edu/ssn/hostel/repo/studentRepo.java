package in.edu.ssn.hostel.repo;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import in.edu.ssn.hostel.model.Student;

@Repository
public interface studentRepo extends JpaRepository<Student, Integer> {

    @Query("SELECT s FROM Student s WHERE "
            + "(:category IS NULL OR LOWER(CONCAT(s.clg, '-', s.department, '-', s.year)) = LOWER(:category)) AND "
            + "(:roomType IS NULL OR LOWER(s.roomType) = LOWER(:roomType)) AND "
            + "s.studentId NOT IN (SELECT COALESCE(g.student1, -1) FROM Groups g) AND "
            + "s.studentId NOT IN (SELECT COALESCE(g.student2, -1) FROM Groups g) AND "
            + "s.studentId NOT IN (SELECT COALESCE(g.student3, -1) FROM Groups g) AND "
            + "s.studentId NOT IN (SELECT COALESCE(g.student4, -1) FROM Groups g) "
            + "ORDER BY s.submittedTime ASC")
    List<Student> findByCategoryAndRoomType(
            @Param("category") String category,
            @Param("roomType") String roomType,
            Pageable pageable);

    @Query("SELECT s FROM Student s WHERE "
            + "(:location IS NULL OR LOWER(s.location) = LOWER(:location)) AND "
            + "(:category IS NULL OR LOWER(CONCAT(s.clg, '-', s.department, '-', s.year)) = LOWER(:category)) AND "
            + "(:roomType IS NULL OR LOWER(s.roomType) = LOWER(:roomType)) AND "
            + "s.studentId NOT IN (SELECT COALESCE(g.student1, -1) FROM Groups g) AND "
            + "s.studentId NOT IN (SELECT COALESCE(g.student2, -1) FROM Groups g) AND "
            + "s.studentId NOT IN (SELECT COALESCE(g.student3, -1) FROM Groups g) AND "
            + "s.studentId NOT IN (SELECT COALESCE(g.student4, -1) FROM Groups g) "
            + "ORDER BY s.submittedTime ASC")
    List<Student> findByLocationAndCategoryAndRoomType(
            @Param("location") String location,
            @Param("category") String category,
            @Param("roomType") String roomType,
            Pageable pageable);

    Student findByEmail(String email);
}
