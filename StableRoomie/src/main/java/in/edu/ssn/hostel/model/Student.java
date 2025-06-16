package in.edu.ssn.hostel.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    private int studentId;
    private String name;
    private String clg;
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
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime submittedTime;
}
