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

    @Autowired
    in.edu.ssn.hostel.repo.roomRepo rrepo;

    @Autowired
    in.edu.ssn.hostel.repo.allotmentRunRepo runRepo;

    public void saveGroups(Map<String, Object> payload) {
        System.out.println(payload);
        List<Map<String, Integer>> groups = (List<Map<String, Integer>>) payload.get("groups");
        System.out.println(groups);
        String roomType = (String) payload.get("roomType");
        
        Long roomId = grepo.findFirstAvailableRoomId(roomType)
                .orElseGet(() -> {
                    in.edu.ssn.hostel.model.Rooms r = new in.edu.ssn.hostel.model.Rooms();
                    r.setRoomType(roomType);
                    return rrepo.save(r).getRoomId();
                });

        int studentCount = 0;
        for (Map<String, Integer> group : groups) {
            if (group.containsKey("student_1")) studentCount++;
            if (group.containsKey("student_2")) studentCount++;
            if (group.containsKey("student_3")) studentCount++;
            if (group.containsKey("student_4")) studentCount++;
        }

        String category = (String) payload.getOrDefault("category", "All");
        String location = (String) payload.getOrDefault("location", "both");

        in.edu.ssn.hostel.model.AllotmentRun run = new in.edu.ssn.hostel.model.AllotmentRun();
        run.setCategory(category);
        run.setLocation(location);
        run.setRoomType(roomType);
        run.setStudentCount(studentCount);
        run.setTimestamp(java.time.LocalDateTime.now());
        run = runRepo.save(run);
        
        Long runId = run.getId();

        for (Map<String, Integer> group : groups) {
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
            if (group.containsKey("student_4")) {
                groupIt.setStudent4((int) group.get("student_4"));
            }
            
            groupIt.setRoomId(roomId);
            groupIt.setRunId(runId);
            grepo.save(groupIt);
        }
    }

    @Autowired
    in.edu.ssn.hostel.repo.studentRepo srepo;

    public List<Map<String, Object>> getAllAllotments() {
        // Auto-migrate legacy groups with null runId
        List<Groups> groupsWithNullRun = grepo.findAll().stream()
                .filter(g -> g.getRunId() == null)
                .collect(java.util.stream.Collectors.toList());
        
        if (!groupsWithNullRun.isEmpty()) {
            in.edu.ssn.hostel.model.AllotmentRun legacyRun = new in.edu.ssn.hostel.model.AllotmentRun();
            legacyRun.setCategory("Legacy Category");
            legacyRun.setLocation("both");
            
            String roomType = "Legacy Allotment";
            if (!groupsWithNullRun.isEmpty()) {
                Long rId = groupsWithNullRun.get(0).getRoomId();
                if (rId != null) {
                    roomType = rrepo.findById(rId).map(r -> r.getRoomType()).orElse("Legacy Allotment");
                }
            }
            legacyRun.setRoomType(roomType);
            
            int count = 0;
            for (Groups g : groupsWithNullRun) {
                if (g.getStudent1() != null) count++;
                if (g.getStudent2() != null) count++;
                if (g.getStudent3() != null) count++;
                if (g.getStudent4() != null) count++;
            }
            legacyRun.setStudentCount(count);
            legacyRun.setTimestamp(java.time.LocalDateTime.now());
            legacyRun = runRepo.save(legacyRun);
            
            Long runId = legacyRun.getId();
            for (Groups g : groupsWithNullRun) {
                g.setRunId(runId);
                grepo.save(g);
            }
        }

        List<in.edu.ssn.hostel.model.AllotmentRun> runs = runRepo.findAll();
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        for (in.edu.ssn.hostel.model.AllotmentRun r : runs) {
            Map<String, Object> rMap = new java.util.HashMap<>();
            rMap.put("id", r.getId());
            rMap.put("category", r.getCategory());
            rMap.put("location", r.getLocation());
            rMap.put("roomType", r.getRoomType());
            rMap.put("studentCount", r.getStudentCount());
            
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            rMap.put("date", r.getTimestamp().format(formatter));
            
            result.add(rMap);
        }
        return result;
    }
}
