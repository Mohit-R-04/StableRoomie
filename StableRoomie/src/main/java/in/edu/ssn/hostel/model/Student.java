package in.edu.ssn.hostel.model;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    private int studentId;
    private String sleepTime;
    private int year;
    private int phone;
    private String wakeTime;
    private String department;
    private String StudyTime;
    private String roomType;
    private String address;
    private int emergencyContact;
    private String preferredRoommates;
    private String studyHabits;
    private String cleanliness;
    private String guestPolicy;
    private String lightSensitivity;
    private String noiseLevel;
    private String hobbies;
}
