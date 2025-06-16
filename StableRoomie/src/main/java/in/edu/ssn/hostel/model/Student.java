package in.edu.ssn.hostel.model;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    private int studentId;
    private String name;
    private String sleepTime;
    private int year;
    private String phone;
    private String wakeTime;
    private String department;
    private String studyTime;
    private String roomType;
    private String address;
    private String emergencyContact;
    private String preferredRoommates;
    private String studyHabits;
    private String cleanliness;
    private String lightSensitivity;
    private String noiseLevel;
    private OffsetDateTime timeStamp;
    private String location;

}
