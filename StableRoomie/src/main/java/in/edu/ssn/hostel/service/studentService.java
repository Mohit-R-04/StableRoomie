package in.edu.ssn.hostel.service;

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
        int numStudents = filters.getNumStudents();

        Pageable pageable = PageRequest.of(0, numStudents);

        if ("both".equalsIgnoreCase(location)) {
            // Filter by category (concatenated clg + department + year) and roomType
            return repo.findByCategoryAndRoomType(category, roomType, pageable);
        } else {
            // Filter by location, category, and roomType
            return repo.findByAddressAndCategoryAndRoomType(location, category, roomType, pageable);
        }
    }
}
