package in.edu.ssn.hostel.controller;

import in.edu.ssn.hostel.model.Rooms;
import in.edu.ssn.hostel.service.roomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class roomsController {
    @Autowired
    roomService room;

    @PostMapping("/room-details")
    public ResponseEntity<Rooms> saveRooms(@RequestBody Map<String, Object> hostelAndRooms){
        return ResponseEntity.ok(room.saveRoom(hostelAndRooms));
    }
    @GetMapping("/get-rooms")
    public List<Rooms> getRooms(){
        return room.getRooms();

    }
}
