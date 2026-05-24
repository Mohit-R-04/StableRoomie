package in.edu.ssn.hostel.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import in.edu.ssn.hostel.service.GroupService;

@RestController
@CrossOrigin
public class groupsController {

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
