package in.edu.ssn.hostel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Groups {

    @Id
    @SequenceGenerator(
            name = "student_sequence",
            sequenceName = "student_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "student_sequence"
    )
    private Long id;
    @Column(name = "student_1", nullable = true)
    private Integer student1;
    @Column(name = "student_2", nullable = true)
    private Integer student2;
    @Column(name = "student_3", nullable = true)
    private Integer student3;
    @Column(name = "student_4", nullable = true)
    private Integer student4;
    @Column(name = "room_id")
    private Long roomId;
    @Column(name = "run_id", nullable = true)
    private Long runId;

    // Explicit getters and setters to ensure Lombok works
    public Integer getStudent1() { return student1; }
    public void setStudent1(Integer student1) { this.student1 = student1; }
    public Integer getStudent2() { return student2; }
    public void setStudent2(Integer student2) { this.student2 = student2; }
    public Integer getStudent3() { return student3; }
    public void setStudent3(Integer student3) { this.student3 = student3; }
    public Integer getStudent4() { return student4; }
    public void setStudent4(Integer student4) { this.student4 = student4; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public Long getRunId() { return runId; }
    public void setRunId(Long runId) { this.runId = runId; }
}
