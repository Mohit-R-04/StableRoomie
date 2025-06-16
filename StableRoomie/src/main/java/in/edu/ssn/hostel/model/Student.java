package in.edu.ssn.hostel.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
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
    @Column(name = "student_id")
    private int studentId;

    @Column(name = "name")
    private String name;

    @Column(name = "clg")
    private String clg;

    @Column(name = "sleep_time")
    private String sleepTime;

    @Column(name = "year")
    private int year;

    @Column(name = "phone")
    private String phone;

    @Column(name = "wake_time")
    private String wakeTime;

    @Column(name = "department")
    private String department;

    @Column(name = "study_time")
    private String studyTime;

    @Column(name = "room_type")
    private String roomType;

    @Column(name = "address")
    private String address;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "preferred_roommates")
    private String preferredRoommates;

    @Column(name = "study_habits")
    private String studyHabits;

    @Column(name = "cleanliness")
    private String cleanliness;

    @Column(name = "light_sensitivity")
    private String lightSensitivity;

    @Column(name = "noise_level")
    private String noiseLevel;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    @Column(name = "submitted_time")
    private LocalDateTime submittedTime;

    @Column(name = "location")
    private String location;
}
