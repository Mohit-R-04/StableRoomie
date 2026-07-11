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

    @Column(name = "student_year")
    private String year;

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

    @Column(name = "email", unique = true)
    private String email;

    // Explicit getters and setters
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClg() { return clg; }
    public void setClg(String clg) { this.clg = clg; }

    public String getSleepTime() { return sleepTime; }
    public void setSleepTime(String sleepTime) { this.sleepTime = sleepTime; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getWakeTime() { return wakeTime; }
    public void setWakeTime(String wakeTime) { this.wakeTime = wakeTime; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getStudyTime() { return studyTime; }
    public void setStudyTime(String studyTime) { this.studyTime = studyTime; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getPreferredRoommates() { return preferredRoommates; }
    public void setPreferredRoommates(String preferredRoommates) { this.preferredRoommates = preferredRoommates; }

    public String getStudyHabits() { return studyHabits; }
    public void setStudyHabits(String studyHabits) { this.studyHabits = studyHabits; }

    public String getCleanliness() { return cleanliness; }
    public void setCleanliness(String cleanliness) { this.cleanliness = cleanliness; }

    public String getLightSensitivity() { return lightSensitivity; }
    public void setLightSensitivity(String lightSensitivity) { this.lightSensitivity = lightSensitivity; }

    public String getNoiseLevel() { return noiseLevel; }
    public void setNoiseLevel(String noiseLevel) { this.noiseLevel = noiseLevel; }

    public LocalDateTime getSubmittedTime() { return submittedTime; }
    public void setSubmittedTime(LocalDateTime submittedTime) { this.submittedTime = submittedTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
