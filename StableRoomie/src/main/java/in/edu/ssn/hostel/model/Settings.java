package in.edu.ssn.hostel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Single-row application settings (fixed id = 1).
 * {@code preferencesOpen} gates whether students may submit or edit their
 * preferences — the warden opens the window for everyone before submissions
 * begin, and closes it again when collection is done.
 */
@Entity
@Table(name = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Settings {

    @Id
    @Column(name = "setting_id")
    private Long id;

    @Column(name = "preferences_open")
    private boolean preferencesOpen;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public boolean isPreferencesOpen() { return preferencesOpen; }
    public void setPreferencesOpen(boolean preferencesOpen) { this.preferencesOpen = preferencesOpen; }
}
