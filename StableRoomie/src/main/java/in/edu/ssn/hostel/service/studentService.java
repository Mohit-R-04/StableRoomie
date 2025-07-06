package in.edu.ssn.hostel.service;

import java.util.ArrayList;
import java.util.List;

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

        String clg;
        String department;
        String clgDepartmentYear;
        int numStudents;
        String year;

        ArrayList<String> cdd = new ArrayList<>();
        try {
            for (String i : category.split("-")) {
                cdd.add(i);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid category format");
        }

        try {
            numStudents = (numStudentsStr != null && !numStudentsStr.isEmpty())
                    ? Integer.parseInt(numStudentsStr)
                    : 100;
        } catch (NumberFormatException e) {
            numStudents = 100;
        }
        System.out.print(cdd);

        if (cdd.get(0).equals("ssn")) {
            clg = "SSN College";
        } else {
            clg = "Shiv Nadar University";
        }

        // Extract department and year
        department = cdd.get(1).toUpperCase();

        year = cdd.get(2);

        clgDepartmentYear = clg + "+" + department + "+" + year;

        Pageable pageable = PageRequest.of(0, numStudents);

        // TODO: PROBLEM WITH FILTER
        if ("both".equalsIgnoreCase(location)) {
            return repo.findByCategoryAndRoomType(clgDepartmentYear, roomType, pageable);
        } else {
            return repo.findByLocationAndCategoryAndRoomType(location, clgDepartmentYear, roomType, pageable);
        }
    }
}
