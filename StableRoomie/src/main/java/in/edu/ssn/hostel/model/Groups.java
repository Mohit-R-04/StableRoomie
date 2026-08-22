package in.edu.ssn.hostel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One row per occupied room. {@code roomId} points at the rooms table row,
 * which identifies the ROOM TYPE (e.g. "3-Sharing"). Every student allotted
 * into the same room shares the same groupId; the actual student->group
 * membership lives in the allotment table.
 *
 * The physical table is named {@code room_groups} because {@code groups}
 * is a reserved SQL keyword in PostgreSQL/H2.
 */
@Entity
@Table(name = "room_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Groups {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;
    @Column(name = "room_id")
    private Long roomId;

    // Explicit getters and setters to ensure Lombok works
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
}
