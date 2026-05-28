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
        
        // Get all rooms of this type with their capacities
        List<Object[]> roomCapacities = grepo.findRoomCapacityByType(roomType);
        if (roomCapacities.isEmpty()) {
            throw new RuntimeException("No available room for the type: " + roomType);
        }

        // Build a list of available room slots (roomId, remaining_capacity)
        // Each room of capacity 'N' can hold floor(N/3) groups (3 students per group)
        java.util.ArrayList<RoomSlot> availableSlots = new java.util.ArrayList<>();
        for (Object[] rc : roomCapacities) {
            Long roomId = (Long) rc[0];
            int capacity = ((Number) rc[1]).intValue();
            int groupsAssigned = grepo.countGroupsByRoomId(roomId);
            int maxGroups = capacity; // each group uses 1 slot in the room
            int remainingSlots = maxGroups - groupsAssigned;
            if (remainingSlots > 0) {
                availableSlots.add(new RoomSlot(roomId, remainingSlots));
            }
        }

        if (availableSlots.isEmpty()) {
            throw new RuntimeException("All rooms of type " + roomType + " are fully occupied");
        }

        int slotIndex = 0;
        int groupsAssignedInCurrentSlot = 0;

        for (Map<String, Integer> group : groups) {
            // Rotate to next room slot if current is full
            while (slotIndex < availableSlots.size() && 
                   groupsAssignedInCurrentSlot >= availableSlots.get(slotIndex).remainingCapacity) {
                slotIndex++;
                groupsAssignedInCurrentSlot = 0;
            }

            if (slotIndex >= availableSlots.size()) {
                throw new RuntimeException("Not enough room capacity for all groups");
            }

            Groups groupIt = new Groups();
            
            if (group.containsKey("student_1")) {
                groupIt.setStudent1((int) group.get("student_1"));
            }
            if (group.containsKey("student_2")) {
                groupIt.setStudent2((int) group.get("student_2"));
            }
            if (group.containsKey("student_3")) {
                groupIt.setStudent3((int) group.get("student_3"));
            }
            
            groupIt.setRoomId(availableSlots.get(slotIndex).roomId);
            grepo.save(groupIt);
            groupsAssignedInCurrentSlot++;
        }
    }

    // Helper class to track room slots
    private static class RoomSlot {
        Long roomId;
        int remainingCapacity;

        RoomSlot(Long roomId, int remainingCapacity) {
            this.roomId = roomId;
            this.remainingCapacity = remainingCapacity;
        }
    }
}
