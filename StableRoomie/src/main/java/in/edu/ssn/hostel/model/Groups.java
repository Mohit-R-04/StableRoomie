package in.edu.ssn.hostel.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Groups {

    @Id
    private String groupId;
    private int student_1;
    private int student_2;
    private int student_3;
    private String roomId;
}
