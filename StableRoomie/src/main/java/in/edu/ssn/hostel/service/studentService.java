package in.edu.ssn.hostel.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import in.edu.ssn.hostel.model.Groups;
import in.edu.ssn.hostel.repo.groupsRepo;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.model.filter;
import in.edu.ssn.hostel.repo.studentRepo;

@Service
public class studentService {

    @Autowired
    studentRepo repo;

    public Student addStudent(Student stud) {
        repo.save(stud);
        return stud;
    }



    public List<Student> getStudents(filter filters) {
        String location = filters.getLocation();
        String category = filters.getCategory();
        String roomType = filters.getRoomType();
        String numStudentsStr = filters.getNumStudents();

        // Safely parse numStudents with a default value
        int numStudents;
        try {
            numStudents = (numStudentsStr != null && !numStudentsStr.isEmpty())
                    ? Integer.parseInt(numStudentsStr)
                    : 100;
        } catch (NumberFormatException e) {
            numStudents = 100;
        }

        // Parse the category field (e.g., 'ssncse2nd' -> 'SSN College+CSE+2', 'snucse1st' -> 'Shiv Nadar University+CSE+1')
        String clgDepartmentYear = null;
        if (category != null && !category.isEmpty()) {
            String clg = null;
            String deptYear = null;

            // Check for college prefix (ssn or snu)
            if (category.startsWith("ssn")) {
                clg = "SSN College";
                deptYear = category.substring(3); // Remove "ssn" prefix
            } else if (category.startsWith("snu")) {
                clg = "Shiv Nadar University";
                deptYear = category.substring(3); // Remove "snu" prefix
            }

            String department = null;
            String year = null;
            if (deptYear != null) {
                // Extract department and year
                if (deptYear.startsWith("cse")) {
                    department = "CSE";
                } else if (deptYear.startsWith("ece")) {
                    department = "ECE";
                } else if (deptYear.startsWith("eee")) {
                    department = "EEE";
                } else if (deptYear.startsWith("mech")) {
                    department = "MECH";
                } else if (deptYear.startsWith("civil")) {
                    department = "CIVIL";
                } else if (deptYear.startsWith("it")) {
                    department = "IT";
                } else if (deptYear.startsWith("bme")) {
                    department = "BME";
                }

                if (deptYear.endsWith("1st")) {
                    year = "1";
                } else if (deptYear.endsWith("2nd")) {
                    year = "2";
                } else if (deptYear.endsWith("3rd")) {
                    year = "3";
                } else if (deptYear.endsWith("4th")) {
                    year = "4";
                }
            }

            if (clg != null && department != null && year != null) {
                clgDepartmentYear = clg + "+" + department + "+" + year;
            } else {
                clgDepartmentYear = category; // Fallback if parsing fails
            }
        }

        Pageable pageable = PageRequest.of(0, numStudents);

        if ("both".equalsIgnoreCase(location)) {
            return repo.findByCategoryAndRoomType(clgDepartmentYear, roomType, pageable);
        } else {
            return repo.findByLocationAndCategoryAndRoomType(location, clgDepartmentYear, roomType, pageable);
        }
    }
}
