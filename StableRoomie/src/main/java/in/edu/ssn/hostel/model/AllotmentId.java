package in.edu.ssn.hostel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite primary key of the allotment table: one row is uniquely
 * identified by the (group, student) pair. A student can never occupy two
 * rows of the same group, and the separate UNIQUE(student_id) constraint
 * additionally prevents one student from belonging to two different groups.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllotmentId implements Serializable {

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "student_id")
    private Integer studentId;

    // Explicit accessors, equals and hashCode to ensure they are always
    // generated regardless of Lombok annotation-processing setup.
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AllotmentId that = (AllotmentId) o;
        return Objects.equals(groupId, that.groupId)
                && Objects.equals(studentId, that.studentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId, studentId);
    }
}
