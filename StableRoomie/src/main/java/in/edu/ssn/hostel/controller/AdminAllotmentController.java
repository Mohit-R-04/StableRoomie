package in.edu.ssn.hostel.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import in.edu.ssn.hostel.service.AllotmentService;

@RestController
@CrossOrigin
public class AdminAllotmentController {

    @Autowired
    private AllotmentService allotmentService;

    @PostMapping("/api/admin/lock-and-allot")
    public ResponseEntity<?> lockAndAllot() {
        try {
            return ResponseEntity.ok(allotmentService.lockAndAllot());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/admin/allotment-results")
    public ResponseEntity<?> getAllotmentResults() {
        return ResponseEntity.ok(allotmentService.getResults());
    }

    @PostMapping("/api/admin/reset-allotment")
    public ResponseEntity<?> resetAllotment() {
        allotmentService.resetAllotment();
        return ResponseEntity.ok(Map.of("message", "Allotment reset. Preferences are unlocked."));
    }
}
