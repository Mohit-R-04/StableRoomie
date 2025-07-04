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

    @PostMapping("/save-groups")
    public ResponseEntity<String> saveGroups(@RequestBody Map<String, Object> payload) {
        group.saveGroups(payload);
        return ResponseEntity.ok("success");
    }
}
