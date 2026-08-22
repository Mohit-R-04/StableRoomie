package in.edu.ssn.hostel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Membership of one student in one group (room). A student may appear at
 * most once across the whole table, which enforces a single active allotment.
 */
@Entity
@Table(name = "allotment",
        uniqueConstraints = @UniqueConstraint(columnNames = "student_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Allotment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allotment_id")
    private Long allotmentId;
    @Column(name = "group_id")
    private Long groupId;
    @Column(name = "student_id")
    private Integer studentId;

    // Explicit getters and setters to ensure Lombok works
    public Long getAllotmentId() { return allotmentId; }
    public void setAllotmentId(Long allotmentId) { this.allotmentId = allotmentId; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }
}
