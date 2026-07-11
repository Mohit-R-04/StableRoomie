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
        int capacity = handr.containsKey("capacity") ? ((Number) handr.get("capacity")).intValue() : 3;
        Rooms room = new Rooms();
        room.setRoomType(hostel);
        room.setCapacity(capacity);
        repo.save(room);
        return room;
    }

    public List<Rooms> getRooms() {
        return repo.findAll();
    }

    public void deleteRoom(Long id) {
        repo.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteByRoomType(String roomType) {
        java.util.List<Rooms> rooms = repo.findByRoomType(roomType);
        for (Rooms r : rooms) {
            repo.delete(r);
        }
    }

    @jakarta.annotation.PostConstruct
    public void initDefaultRooms() {
        if (repo.count() == 0) {
            Rooms room1 = new Rooms();
            room1.setRoomType("3-Sharing");
            room1.setCapacity(3);
            repo.save(room1);

            Rooms room2 = new Rooms();
            room2.setRoomType("2-Sharing");
            room2.setCapacity(2);
            repo.save(room2);
        }
    }
}
