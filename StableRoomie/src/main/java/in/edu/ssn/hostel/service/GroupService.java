package in.edu.ssn.hostel.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.edu.ssn.hostel.model.Groups;
import in.edu.ssn.hostel.repo.groupsRepo;

@Service
public class GroupService {

    @Autowired
    groupsRepo grepo;

    public void saveGroups(Map<String, Object> payload) {
        System.out.println(payload);
        List<Map<String, Integer>> groups = (List<Map<String, Integer>>) payload.get("groups");
        System.out.println(groups);
        String roomType = (String) payload.get("roomType");
        Optional<Long> roomid = grepo.findFirstAvailableRoomId(roomType);
        System.out.println(roomid);
        if (roomid.isEmpty()) {
            throw new RuntimeException("No available room for the type: " + roomType);
        }

        for (Map<String, Integer> group : groups) {
            int student_1 = (int) group.get("student_1");
            int student_2 = (int) group.get("students_2");
            int student_3 = (int) group.get("student_3");
            Groups groupIt = new Groups();
            groupIt.setStudent_1(student_1);
            groupIt.setStudent_2(student_2);
            groupIt.setStudent_3(student_3);
            groupIt.setRoomId(roomid.get());
            grepo.save(groupIt);
        }
    }

}
