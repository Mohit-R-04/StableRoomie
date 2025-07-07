package in.edu.ssn.hostel.service;

import in.edu.ssn.hostel.model.Rooms;
import in.edu.ssn.hostel.repo.roomRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class roomService {
    @Autowired
    roomRepo repo;
    public Rooms saveRoom(Map<String, Object> handr){
        String hostel = (String) handr.get("name");
        int roomNo = (int) handr.get("no");

        System.out.println(hostel);
        System.out.println(roomNo);
        Rooms room = new Rooms();
        room.setRoomType(hostel);
        room.setNoOfStudents(roomNo);
        repo.save(room);
        return room;
    }

    public List<Rooms> getRooms() {
        return repo.findAll();
    }
}
