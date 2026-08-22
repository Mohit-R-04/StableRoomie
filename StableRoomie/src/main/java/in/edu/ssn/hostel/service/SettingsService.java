package in.edu.ssn.hostel.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import in.edu.ssn.hostel.model.Settings;
import in.edu.ssn.hostel.repo.settingsRepo;

@Service
public class SettingsService {

    private static final Long SETTINGS_ID = 1L;

    @Autowired
    private settingsRepo repo;

    /** Loads the single settings row, creating it closed (false) on first use. */
    @Transactional
    public Settings getSettings() {
        return repo.findById(SETTINGS_ID).orElseGet(() -> {
            Settings s = new Settings();
            s.setId(SETTINGS_ID);
            s.setPreferencesOpen(false);
            return repo.save(s);
        });
    }

    public boolean arePreferencesOpen() {
        return getSettings().isPreferencesOpen();
    }

    @Transactional
    public Settings setPreferencesOpen(boolean open) {
        Settings s = getSettings();
        s.setPreferencesOpen(open);
        return repo.save(s);
    }
}
