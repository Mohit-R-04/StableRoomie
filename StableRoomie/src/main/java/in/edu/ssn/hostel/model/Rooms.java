package in.edu.ssn.hostel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rooms {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;
    @Column(name = "room_type")
    private String roomType;
    @Column(name = "no_of_students")
    private int noOfStudents;

    // Explicit getters and setters
    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }
    public int getNoOfStudents() { return noOfStudents; }
    public void setNoOfStudents(int noOfStudents) { this.noOfStudents = noOfStudents; }
}
