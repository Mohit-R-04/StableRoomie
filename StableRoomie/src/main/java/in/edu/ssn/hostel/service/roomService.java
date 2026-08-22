package in.edu.ssn.hostel.service;

import in.edu.ssn.hostel.model.Rooms;
import in.edu.ssn.hostel.repo.roomRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class roomService {
    @Autowired
    roomRepo repo;

    public Rooms saveRoom(Map<String, Object> handr) {
        String roomType = (String) handr.get("name");
        int capacity = handr.containsKey("capacity") ? ((Number) handr.get("capacity")).intValue() : 3;
        int totalRooms = handr.containsKey("totalRooms") ? ((Number) handr.get("totalRooms")).intValue() : 0;
        Rooms room = new Rooms();
        room.setRoomType(roomType);
        room.setCapacity(capacity);
        room.setTotalRooms(totalRooms);
        repo.save(room);
        return room;
    }

    public Rooms updateRoom(Long id, Map<String, Object> body) {
        Rooms room = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room type not found with id: " + id));
        if (body.containsKey("capacity")) {
            room.setCapacity(((Number) body.get("capacity")).intValue());
        }
        if (body.containsKey("totalRooms")) {
            room.setTotalRooms(((Number) body.get("totalRooms")).intValue());
        }
        repo.save(room);
        return room;
    }

    public List<Rooms> getRooms() {
        return repo.findAll(Sort.by("roomId"));
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
            room1.setTotalRooms(20);
            repo.save(room1);

            Rooms room2 = new Rooms();
            room2.setRoomType("2-Sharing");
            room2.setCapacity(2);
            room2.setTotalRooms(10);
            repo.save(room2);

            Rooms room3 = new Rooms();
            room3.setRoomType("4-Sharing");
            room3.setCapacity(4);
            room3.setTotalRooms(5);
            repo.save(room3);
        }
    }
}
