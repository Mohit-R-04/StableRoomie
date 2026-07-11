package in.edu.ssn.hostel.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PathVariable;
import in.edu.ssn.hostel.service.GroupService;

@RestController
@CrossOrigin
public class groupsController {

    @Autowired
    private in.edu.ssn.hostel.repo.groupsRepo grepo;

    @Autowired
    private in.edu.ssn.hostel.repo.studentRepo srepo;

    @GetMapping("/api/admin/allotment-run/{runId}/groups")
    public ResponseEntity<?> getGroupsByRunId(@PathVariable Long runId) {
        java.util.List<in.edu.ssn.hostel.model.Groups> groupsList = grepo.findByRunId(runId);
        java.util.List<Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (in.edu.ssn.hostel.model.Groups g : groupsList) {
            Map<String, Object> gMap = new java.util.HashMap<>();
            gMap.put("roomId", g.getRoomId());
            
            if (g.getStudent1() != null) {
                srepo.findById(g.getStudent1()).ifPresent(s -> gMap.put("student_1", s.getName() + " (" + s.getStudentId() + ")"));
            }
            if (g.getStudent2() != null) {
                srepo.findById(g.getStudent2()).ifPresent(s -> gMap.put("student_2", s.getName() + " (" + s.getStudentId() + ")"));
            }
            if (g.getStudent3() != null) {
                srepo.findById(g.getStudent3()).ifPresent(s -> gMap.put("student_3", s.getName() + " (" + s.getStudentId() + ")"));
            }
            if (g.getStudent4() != null) {
                srepo.findById(g.getStudent4()).ifPresent(s -> gMap.put("student_4", s.getName() + " (" + s.getStudentId() + ")"));
            }
            result.add(gMap);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/admin/allotments")
    public ResponseEntity<?> getAllAllotments() {
        return ResponseEntity.ok(group.getAllAllotments());
    }

    @Autowired
    GroupService group;

    @org.springframework.beans.factory.annotation.Value("${FLASK_API_URL:http://127.0.0.1:5000}")
    private String flaskApiUrl;

    @Autowired
    private org.springframework.web.client.RestTemplate restTemplate;

    @PostMapping("/save-groups")
    public ResponseEntity<String> saveGroups(@RequestBody Map<String, Object> payload) {
        group.saveGroups(payload);
        return ResponseEntity.ok("success");
    }

    @PostMapping("/allot_roommates")
    public ResponseEntity<String> allotRoommates(@RequestBody Map<String, Object> payload) {
        String url = flaskApiUrl + "/allot_roommates";
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, payload, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }
}
