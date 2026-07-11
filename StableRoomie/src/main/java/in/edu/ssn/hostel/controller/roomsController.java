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

    @DeleteMapping("/remove-room/{id}")
    public ResponseEntity<Void> removeRoom(@PathVariable Long id) {
        room.deleteRoom(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove-room-type/{roomType}")
    public ResponseEntity<Void> removeRoomType(@PathVariable String roomType) {
        room.deleteByRoomType(roomType);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/remove-room-type")
    public void removeRoomTypeLegacy(@RequestParam("roomType") String roomType, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        room.deleteByRoomType(roomType);
        response.sendRedirect("/admin/dashboard");
    }

    @PostMapping("/edit-room-type")
    public void editRoomTypeLegacy(jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        response.sendRedirect("/admin/dashboard");
    }
}
