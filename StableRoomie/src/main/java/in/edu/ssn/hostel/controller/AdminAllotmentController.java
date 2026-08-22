package in.edu.ssn.hostel.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import in.edu.ssn.hostel.model.Settings;
import in.edu.ssn.hostel.service.AllotmentService;
import in.edu.ssn.hostel.service.SettingsService;

@RestController
@CrossOrigin
public class AdminAllotmentController {

    @Autowired
    private AllotmentService allotmentService;

    @Autowired
    private SettingsService settingsService;

    @GetMapping("/api/admin/preferences-window")
    public ResponseEntity<?> getPreferencesWindow() {
        return ResponseEntity.ok(Map.of("preferencesOpen", settingsService.arePreferencesOpen()));
    }

    /** Opens or closes the preference-selection window for all students. */
    @PostMapping("/api/admin/preferences-window")
    public ResponseEntity<?> setPreferencesWindow(@RequestBody Map<String, Object> body) {
        boolean open = Boolean.TRUE.equals(body.get("open"));
        Settings settings = settingsService.setPreferencesOpen(open);
        return ResponseEntity.ok(Map.of("preferencesOpen", settings.isPreferencesOpen()));
    }

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

    /** Deletes every student, room type, group and allotment, and resets the
     *  preference window to closed. Full wipe back to the fresh state. */
    @PostMapping("/api/admin/flush-all-data")
    public ResponseEntity<?> flushAllData() {
        return ResponseEntity.ok(allotmentService.flushAllData());
    }
}
