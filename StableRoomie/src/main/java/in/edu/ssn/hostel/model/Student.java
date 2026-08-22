package in.edu.ssn.hostel.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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

    @Column(name = "room_type_pref_1")
    private String roomTypePref1;

    @Column(name = "room_type_pref_2")
    private String roomTypePref2;

    @Column(name = "room_type_pref_3")
    private String roomTypePref3;

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

    @Column(name = "location")
    private String location;

    @Column(name = "email", unique = true)
    private String email;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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

    public String getRoomTypePref1() { return roomTypePref1; }
    public void setRoomTypePref1(String roomTypePref1) { this.roomTypePref1 = roomTypePref1; }

    public String getRoomTypePref2() { return roomTypePref2; }
    public void setRoomTypePref2(String roomTypePref2) { this.roomTypePref2 = roomTypePref2; }

    public String getRoomTypePref3() { return roomTypePref3; }
    public void setRoomTypePref3(String roomTypePref3) { this.roomTypePref3 = roomTypePref3; }

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

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
