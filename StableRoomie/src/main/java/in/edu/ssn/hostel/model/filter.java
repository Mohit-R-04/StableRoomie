package in.edu.ssn.hostel.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class filter {

    private String location;
    private String category;
    private String roomType;
    private String numStudents;

    // Explicit getters
    public String getLocation() { return location; }
    public String getCategory() { return category; }
    public String getRoomType() { return roomType; }
    public String getNumStudents() { return numStudents; }
}
