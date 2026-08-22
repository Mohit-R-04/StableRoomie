package in.edu.ssn.hostel.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Membership of one student in one group (room). The primary key is the
 * natural (group_id, student_id) pair; a student may appear at most once
 * across the whole table, which enforces a single active allotment.
 */
@Entity
@Table(name = "allotment",
        uniqueConstraints = @UniqueConstraint(columnNames = "student_id"))
@Data
@NoArgsConstructor
public class Allotment {

    @EmbeddedId
    private AllotmentId id;

    // Convenience accessors delegating to the embedded key, so callers keep
    // using getGroupId()/setGroupId()/getStudentId()/setStudentId().
    public Long getGroupId() {
        return id == null ? null : id.getGroupId();
    }

    public void setGroupId(Long groupId) {
        if (id == null) {
            id = new AllotmentId();
        }
        id.setGroupId(groupId);
    }

    public Integer getStudentId() {
        return id == null ? null : id.getStudentId();
    }

    public void setStudentId(Integer studentId) {
        if (id == null) {
            id = new AllotmentId();
        }
        id.setStudentId(studentId);
    }
}
