package in.edu.ssn.hostel.controller;

import in.edu.ssn.hostel.model.Rooms;
import in.edu.ssn.hostel.service.AllotmentService;
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

    @Autowired
    AllotmentService allotmentService;

    @PostMapping("/room-details")
    public ResponseEntity<?> saveRooms(@RequestBody Map<String, Object> hostelAndRooms){
        if (allotmentService.isLocked()) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "Allotment is already finalized. Reset the allotment before modifying rooms."));
        }
        return ResponseEntity.ok(room.saveRoom(hostelAndRooms));
    }

    @PostMapping("/update-room/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        if (allotmentService.isLocked()) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "Allotment is already finalized. Reset the allotment before modifying rooms."));
        }
        try {
            return ResponseEntity.ok(room.updateRoom(id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/get-rooms")
    public List<Rooms> getRooms(){
        return room.getRooms();
    }

    @DeleteMapping("/remove-room/{id}")
    public ResponseEntity<?> removeRoom(@PathVariable Long id) {
        if (allotmentService.isLocked()) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "Allotment is already finalized. Reset the allotment before modifying rooms."));
        }
        room.deleteRoom(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove-room-type/{roomType}")
    public ResponseEntity<?> removeRoomType(@PathVariable String roomType) {
        if (allotmentService.isLocked()) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "Allotment is already finalized. Reset the allotment before modifying rooms."));
        }
        room.deleteByRoomType(roomType);
        return ResponseEntity.ok().build();
    }
}
