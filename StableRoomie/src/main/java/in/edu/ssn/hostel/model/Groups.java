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
    @Column(name = "student_1")
    private int student1;
    @Column(name = "student_2")
    private int student2;
    @Column(name = "student_3")
    private int student3;
    @Column(name = "room_id")
    private Long roomId;

    // Explicit getters and setters to ensure Lombok works
    public int getStudent1() { return student1; }
    public void setStudent1(int student1) { this.student1 = student1; }
    public int getStudent2() { return student2; }
    public void setStudent2(int student2) { this.student2 = student2; }
    public int getStudent3() { return student3; }
    public void setStudent3(int student3) { this.student3 = student3; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
}
