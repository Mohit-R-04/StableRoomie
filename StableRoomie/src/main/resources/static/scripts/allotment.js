/* ------------------------------------------------------------------ */
/* Student preference submission                                       */
/* ------------------------------------------------------------------ */

document
  .querySelector(".js-submitIt")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const name = document.querySelector(".js-name").value;
    const clg = document.querySelector(".js-clg").value;
    const sleep = document.querySelector(".js-sleep").value;
    const wake = document.querySelector(".js-wake").value;
    const department = document.querySelector(".js-department").value.trim().toUpperCase();
    const year = document.querySelector(".js-year").value;
    const phone = document.querySelector(".js-phone").value;
    const studentId = Number(document.querySelector(".js-studentId").value);
    const studyTime = document.querySelector(".js-study").value;
    const roomTypePref1 = document.querySelector(".js-room-pref1").value;
    const roomTypePref2 = document.querySelector(".js-room-pref2").value;
    const roomTypePref3 = document.querySelector(".js-room-pref3").value;
    const address = document.querySelector(".js-home").value;
    const emergencyContact = document.querySelector(".js-emergency").value;
    const roomMates = document.querySelector(".js-friends").value;
    const studyHabbits = document.querySelector(".js-studyHabbits").value;
    const clean = document.querySelector(".js-clean").value;
    const light = document.querySelector(".js-light").value;
    const noise = document.querySelector(".js-noise").value;
    const location = document.querySelector(".js-location").value;

    if (!department) {
      showToast("Please enter your department.", "warning");
      return;
    }
    if (!roomTypePref1) {
      showToast("Please select your 1st choice room type.", "warning");
      return;
    }
    const prefs = [roomTypePref1, roomTypePref2, roomTypePref3].filter((p) => p);
    if (new Set(prefs).size !== prefs.length) {
      showToast("Room type preferences must all be different.", "warning");
      return;
    }

    const clgFullName = clg === "ssn" ? "SSN College" : "Shiv Nadar University";

    const payload = {
      name: name,
      clg: clgFullName,
      sleepTime: sleep,
      wakeTime: wake,
      department: department,
      year: year,
      phone: phone,
      studentId: studentId,
      studyTime: studyTime,
      roomTypePref1: roomTypePref1,
      roomTypePref2: roomTypePref2,
      roomTypePref3: roomTypePref3,
      address: address,
      emergencyContact: emergencyContact,
      preferredRoommates: roomMates,
      studyHabits: studyHabbits,
      cleanliness: clean,
      lightSensitivity: light,
      noiseLevel: noise,
      location: location,
    };

    try {
      const response = await fetch("/saveStudents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      showToast("Preferences saved successfully!", "success");
      await loadStudentProfile();
      switchSection("student-overview", document.getElementById("link-student-overview"));
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to save preferences: " + error.message, "error");
    }
  });

/* ------------------------------------------------------------------ */
/* Toast notifications + confirm dialogs                               */
/* ------------------------------------------------------------------ */

function showToast(message, type = "info", duration = 4000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : type === "warning" ? "⚠" : "ℹ";
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg"></span>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;
  toast.querySelector(".toast-msg").textContent = message;
  toast.querySelector(".toast-close").addEventListener("click", () => dismissToast(toast));
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains("toast-out")) return;
  toast.classList.add("toast-out");
  setTimeout(() => toast.remove(), 300);
}

/**
 * Promise-based confirmation dialog. Resolves true on confirm, false on
 * cancel / overlay click / Escape.
 */
function showConfirmDialog({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, icon = "❓" }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="confirm-icon ${danger ? "confirm-icon-danger" : ""}">${icon}</div>
        <h3 class="confirm-title"></h3>
        <div class="confirm-message"></div>
        <div class="confirm-actions">
          <button class="btn secondary confirm-cancel"></button>
          <button class="btn ${danger ? "remove" : "primary"} confirm-ok"></button>
        </div>
      </div>
    `;
    overlay.querySelector(".confirm-title").textContent = title;
    overlay.querySelector(".confirm-message").innerHTML = message;
    overlay.querySelector(".confirm-cancel").textContent = cancelLabel;
    overlay.querySelector(".confirm-ok").textContent = confirmLabel;

    const cleanup = (result) => {
      overlay.removeEventListener("keydown", onKey);
      overlay.remove();
      resolve(result);
    };
    const onKey = (e) => {
      if (e.key === "Escape") cleanup(false);
      if (e.key === "Enter" && document.activeElement.classList.contains("confirm-ok")) cleanup(true);
    };
    overlay.querySelector(".confirm-ok").addEventListener("click", () => cleanup(true));
    overlay.querySelector(".confirm-cancel").addEventListener("click", () => cleanup(false));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup(false);
    });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.querySelector(".confirm-ok").focus(), 50);
  });
}

/* ------------------------------------------------------------------ */
/* Session / navigation helpers                                        */
/* ------------------------------------------------------------------ */

function showLanding() {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  document.getElementById("landing-page").classList.add("active");
  clearSessionData();
}

function handleLogout() {
  clearSessionData();
  window.location.href = "/logout";
}

function clearSessionData() {
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
}

async function checkUserRoleAndShowDashboard() {
  try {
    const response = await fetch("/api/user-info", { method: "GET", credentials: "include" });
    if (response.ok) {
      const userInfo = await response.json();
      if (userInfo.authenticated) {
        sessionStorage.setItem("userRole", userInfo.role);
        sessionStorage.setItem("userEmail", userInfo.email);
        sessionStorage.setItem("isAuthenticated", "true");
        if (userInfo.role === "ADMIN") {
          showAdminDashboard();
        } else if (userInfo.role === "STUDENT") {
          showStudentDashboard();
          loadStudentProfile();
        } else {
          showLanding();
        }
        return;
      }
    }
    clearSessionData();
    showLanding();
  } catch (error) {
    console.error("Error checking user role:", error);
    clearSessionData();
    showLanding();
  }
}

function switchSection(sectionId, element) {
  document.querySelectorAll(".content-section").forEach((sec) => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

  const sidebar = document.querySelector(".app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && sidebar.classList.contains("mobile-open")) {
    sidebar.classList.remove("mobile-open");
    if (overlay) overlay.style.display = "none";
  }

  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));
  if (element) {
    element.classList.add("active");
  } else {
    const activeLink = document.getElementById(`link-${sectionId}`);
    if (activeLink) activeLink.classList.add("active");
  }

  if (sectionId === "admin-tracking") {
    loadTrackPreferences();
  } else if (sectionId === "admin-rooms") {
    showRooms();
  } else if (sectionId === "admin-allotment") {
    loadRoomConfig();
  } else if (sectionId === "admin-overview") {
    loadAllotmentStats();
    loadAllotmentResults();
  }
}

function showAdminDashboard() {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  const appContainer = document.getElementById("app-container");
  if (appContainer) appContainer.classList.add("active");

  const badge = document.getElementById("user-role-badge");
  if (badge) badge.textContent = "Admin";

  document.querySelectorAll(".admin-only").forEach((el) => (el.style.display = ""));
  document.querySelectorAll(".student-only").forEach((el) => (el.style.display = "none"));

  switchSection("admin-overview", document.getElementById("link-admin-overview"));
  loadAllotmentStats();
  loadAllotmentResults();
}

function showStudentDashboard() {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  const appContainer = document.getElementById("app-container");
  if (appContainer) appContainer.classList.add("active");

  const badge = document.getElementById("user-role-badge");
  if (badge) badge.textContent = "Student";

  document.querySelectorAll(".student-only").forEach((el) => (el.style.display = ""));
  document.querySelectorAll(".admin-only").forEach((el) => (el.style.display = "none"));

  switchSection("student-overview", document.getElementById("link-student-overview"));
  loadStudentAllotment();
}

function toggleDetailsList(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = container.style.display === "none" ? "block" : "none";
  }
}

function handleLoginWithAccountChooser() {
  window.location.href = "/oauth2/authorization/google?prompt=select_account";
}

function toggleMobileSidebar() {
  const sidebar = document.querySelector(".app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("mobile-open");
    overlay.style.display = sidebar.classList.contains("mobile-open") ? "block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  showRooms();
  checkUserRoleAndShowDashboard();
  sendRoomAndHostel();
});

/* ------------------------------------------------------------------ */
/* Admin: room types                                                   */
/* ------------------------------------------------------------------ */

async function showRooms() {
  try {
    const [roomsResp, resultsResp] = await Promise.all([
      fetch("/get-rooms"),
      fetch("/api/admin/allotment-results").catch(() => null),
    ]);
    if (!roomsResp.ok) throw new Error(`HTTP error! status: ${roomsResp.status}`);
    const rooms = await roomsResp.json();

    // usedRooms per room type from the allotment results
    const usedByType = {};
    if (resultsResp && resultsResp.ok) {
      const results = await resultsResp.json();
      (results.roomTypes || []).forEach((t) => {
        usedByType[t.roomType] = t.usedRooms;
      });
    }

    // Config summary (configured count + total capacity)
    const configuredCount = rooms.filter((r) => (r.capacity || 0) > 0 && (r.totalRooms || 0) > 0).length;
    const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0) * (r.totalRooms || 0), 0);
    const statusEl = document.getElementById("room-config-status");
    if (statusEl) {
      statusEl.textContent = rooms.length === 0
        ? "No room types configured yet"
        : `${configuredCount} of ${rooms.length} room types configured`;
    }
    const capEl = document.getElementById("room-total-capacity");
    if (capEl) capEl.textContent = `Total capacity: ${totalCapacity} seats`;
    const readyEl = document.getElementById("room-setup-ready");
    if (readyEl) readyEl.style.display = rooms.length > 0 && configuredCount === rooms.length ? "inline-block" : "none";
    const hintEl = document.getElementById("room-setup-hint");
    if (hintEl) {
      hintEl.innerHTML = rooms.length > 0 && configuredCount === rooms.length
        ? "✔ All room types configured — you can now run <strong>Lock and Allot</strong>."
        : "⚠️ The warden <strong>must</strong> enter the students-per-room and total rooms for every room type before clicking <strong>Lock and Allot</strong>.";
    }

    // Admin room-type table with editable students-per-room and total rooms
    const roomList = document.getElementById("room-type-list");
    if (roomList) {
      roomList.innerHTML = "";
      if (rooms.length === 0) {
        roomList.innerHTML = '<tr><td colspan="7" class="no-data" style="text-align: center; padding: 24px; color: #64748b;">No room types added yet. Use the form below to add one.</td></tr>';
      } else {
        rooms.forEach((room) => {
          const usedRooms = usedByType[room.roomType] != null ? usedByType[room.roomType] : 0;
          const capacity = room.capacity || "";
          const totalRooms = room.totalRooms || 0;
          const totalCap = capacity && totalRooms ? capacity * totalRooms : "—";
          const configured = capacity > 0 && totalRooms > 0;
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${room.roomType}</strong></td>
            <td><input type="number" class="room-edit-input" id="cap-${room.roomId}" min="1" value="${capacity}" placeholder="—" /></td>
            <td><input type="number" class="room-edit-input" id="total-${room.roomId}" min="1" value="${totalRooms}" /></td>
            <td>${totalCap}</td>
            <td>${usedRooms}</td>
            <td>${configured ? '<span class="badge complete">Configured</span>' : '<span class="badge incomplete">Needs rooms</span>'}</td>
            <td style="text-align: right; white-space: nowrap;">
              <button class="btn primary small" onclick="updateRoomConfig(${room.roomId}, '${room.roomType}')">Save</button>
              <button class="btn secondary small remove" onclick="removeRoom(${room.roomId}, '${room.roomType}')">Remove</button>
            </td>
          `;
          roomList.appendChild(tr);
        });
      }
    }

    // Room-type dropdowns for the student form (3 preference selects)
    let roomHTML = "";
    rooms.forEach((room) => {
      roomHTML += `<option value="${room.roomType}">${room.roomType} (${room.capacity || 3} students)</option>`;
    });
    const pref1 = document.querySelector(".js-room-pref1");
    if (pref1) pref1.innerHTML = roomHTML || '<option value="">No room types available</option>';
    const pref2 = document.querySelector(".js-room-pref2");
    if (pref2) pref2.innerHTML = '<option value="">-- None --</option>' + roomHTML;
    const pref3 = document.querySelector(".js-room-pref3");
    if (pref3) pref3.innerHTML = '<option value="">-- None --</option>' + roomHTML;
  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}

async function updateRoomConfig(id, roomType) {
  const capInput = document.getElementById(`cap-${id}`);
  const totalInput = document.getElementById(`total-${id}`);
  const capacity = capInput ? parseInt(capInput.value) : 0;
  const totalRooms = totalInput ? parseInt(totalInput.value) : 0;
  if (!capacity || capacity < 1) {
    showToast("Students per room must be at least 1.", "warning");
    return;
  }
  if (!totalRooms || totalRooms < 1) {
    showToast("Total rooms must be at least 1.", "warning");
    return;
  }
  try {
    const response = await fetch(`/update-room/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capacity: capacity, totalRooms: totalRooms }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update room type");
    }
    showToast(`${roomType} updated: ${capacity} students/room, ${totalRooms} rooms.`, "success");
    showRooms();
  } catch (error) {
    console.error("Error updating room type:", error);
    showToast("Failed to update room type: " + error.message, "error");
  }
}

async function removeRoom(id, roomType) {
  const ok = await showConfirmDialog({
    title: "Remove Room Type",
    message: `<p>Remove <strong>${roomType}</strong>? This deletes the room type configuration.</p><p class="confirm-note">Existing allotments referencing it are not deleted.</p>`,
    confirmLabel: "Remove",
    cancelLabel: "Cancel",
    danger: true,
    icon: "🗑",
  });
  if (!ok) return;
  try {
    const response = await fetch(`/remove-room/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete room type");
    }
    showRooms();
    showToast(`Room type "${roomType}" removed.`, "success");
  } catch (error) {
    console.error("Error removing room:", error);
    showToast("Failed to remove room type: " + error.message, "error");
  }
}

function sendRoomAndHostel() {
  const addButton = document.querySelector(".js-add-button");
  if (!addButton) return;
  addButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const name = document.querySelector(".js-getHostel").value;
    const capacityInput = document.querySelector(".js-getRoomCapacity");
    const totalRoomsInput = document.querySelector(".js-getRoomTotalRooms");
    const capacity = capacityInput ? parseInt(capacityInput.value) : 3;
    const totalRooms = totalRoomsInput ? parseInt(totalRoomsInput.value) : 0;
    if (!name) {
      showToast("Please fill in the room type name.", "warning");
      return;
    }
    if (!totalRooms || totalRooms < 1) {
      showToast("Please enter the total number of rooms available for this type.", "warning");
      return;
    }
    try {
      const response = await fetch("/room-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, capacity, totalRooms }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add room type");
      }
      document.querySelector(".js-getHostel").value = "";
      if (capacityInput) capacityInput.value = "3";
      if (totalRoomsInput) totalRoomsInput.value = "0";
      showRooms();
      showToast(`Room type "${name}" added.`, "success");
    } catch (error) {
      console.error("Error adding room type:", error);
      showToast("Failed to add room type: " + error.message, "error");
    }
  });
}

/* ------------------------------------------------------------------ */
/* Admin: Lock & Allot                                                 */
/* ------------------------------------------------------------------ */

async function loadRoomConfig() {
  try {
    const [roomsResp, resultsResp] = await Promise.all([
      fetch("/get-rooms"),
      fetch("/api/admin/allotment-results"),
    ]);
    const rooms = await roomsResp.json();
    const results = await resultsResp.json();

    const tableBody = document.getElementById("lock-config-table-body");
    if (tableBody) {
      tableBody.innerHTML = "";
      let allConfigured = rooms.length > 0;
      rooms.forEach((room) => {
        const tr = document.createElement("tr");
        const totalCapacity = (room.totalRooms || 0) * (room.capacity || 0);
        if (!room.totalRooms || room.totalRooms < 1) allConfigured = false;
        tr.innerHTML = `
          <td><strong>${room.roomType}</strong></td>
          <td>${room.capacity || "-"}</td>
          <td>${room.totalRooms || 0} ${!room.totalRooms || room.totalRooms < 1 ? '<span class="badge incomplete">required</span>' : ""}</td>
          <td>${totalCapacity}</td>
        `;
        tableBody.appendChild(tr);
      });
      if (rooms.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">No room types configured yet. Add them under Room Types.</td></tr>';
      }
    }

    const submittedCount = document.getElementById("submitted-students-count");
    if (submittedCount) {
      submittedCount.textContent = (results.allottedCount || 0) + (results.unallottedCount || 0);
    }

    // Preference selection window state
    const prefOpen = !!results.preferencesOpen;
    currentPrefWindowOpen = prefOpen;
    const prefStatus = document.getElementById("pref-window-status");
    if (prefStatus) {
      prefStatus.textContent = prefOpen ? "Open" : "Closed";
      prefStatus.className = prefOpen ? "badge complete" : "badge incomplete";
    }
    const prefBtn = document.getElementById("pref-window-btn");
    if (prefBtn) {
      prefBtn.textContent = prefOpen ? "Close Preference Selection" : "Open Preference Selection";
      prefBtn.classList.toggle("remove", prefOpen);
      prefBtn.classList.toggle("primary", !prefOpen);
    }
    const prefHint = document.getElementById("pref-window-hint");
    if (prefHint) {
      prefHint.textContent = prefOpen
        ? "Window is open — students can submit and edit their preferences."
        : "Students cannot submit preferences until you open the window.";
    }

    const locked = !!results.locked;
    const lockBtn = document.getElementById("lock-allot-btn");
    const resetBtn = document.getElementById("reset-allotment-btn");
    const banner = document.getElementById("allotment-locked-banner");
    const hint = document.getElementById("lock-allot-hint");

    if (lockBtn) {
      lockBtn.disabled = locked || !allConfigured;
      lockBtn.textContent = locked ? "Allotment Completed" : "🔒 Lock and Allot";
      if (!locked && !allConfigured) {
        lockBtn.title = "Enter total rooms for all room types first";
      }
    }
    if (resetBtn) resetBtn.style.display = locked ? "inline-block" : "none";
    if (banner) banner.style.display = locked ? "block" : "none";
    if (hint) hint.style.display = locked ? "none" : "block";

    if (locked) {
      document.getElementById("allotment-results").style.display = "block";
      renderResults(results);
    }
  } catch (error) {
    console.error("Error loading room config:", error);
  }
}

let currentPrefWindowOpen = false;

async function togglePreferencesWindow() {
  const open = !currentPrefWindowOpen;
  const ok = await showConfirmDialog({
    title: open ? "Open Preference Selection" : "Close Preference Selection",
    message: open
      ? "<p>All students will be able to <strong>submit and edit</strong> their preferences.</p>"
      : "<p>Students will <strong>no longer</strong> be able to submit or edit their preferences.</p>",
    confirmLabel: open ? "Open Window" : "Close Window",
    cancelLabel: "Cancel",
    icon: open ? "📢" : "🔒",
  });
  if (!ok) return;

  try {
    const response = await fetch("/api/admin/preferences-window", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ open: open }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update the preference window");
    currentPrefWindowOpen = data.preferencesOpen;
    showToast(
      data.preferencesOpen
        ? "Preference selection is now open for all students."
        : "Preference selection is now closed.",
      "success"
    );
    await loadRoomConfig();
  } catch (error) {
    console.error("Error updating preference window:", error);
    showToast("Failed to update the preference window: " + error.message, "error");
  }
}

async function lockAndAllot() {
  // Build a live summary of what the allotment will do.
  let summaryHtml = `
    <p>This will <strong>finalize the allotment for every student</strong> and
    <strong>lock all preference changes</strong>. Students are prioritized by
    preference update time and placed into their 1st, then 2nd, then 3rd choice
    room types.</p>
    <p class="confirm-note">Students who fit into no room type are reported as
    unallotted in the results and the final PDF — no allotment entry is created
    for them.</p>
  `;
  try {
    const [roomsResp, resultsResp] = await Promise.all([
      fetch("/get-rooms"),
      fetch("/api/admin/allotment-results"),
    ]);
    const rooms = await roomsResp.json();
    const results = await resultsResp.json();
    const totalSeats = rooms.reduce((s, r) => s + (r.capacity || 0) * (r.totalRooms || 0), 0);
    const submitted = (results.allottedCount || 0) + (results.unallottedCount || 0);
    const expectedUnallotted = Math.max(0, submitted - totalSeats);
    summaryHtml = `
      <p>This will <strong>finalize the allotment for every student</strong> and
      <strong>lock all preference changes</strong>.</p>
      <table class="confirm-summary-table">
        <tr><td>Students with preferences</td><td><strong>${submitted}</strong></td></tr>
        <tr><td>Total room capacity</td><td><strong>${totalSeats}</strong> seats</td></tr>
        <tr><td>Expected unallotted</td><td><strong>${expectedUnallotted}</strong></td></tr>
      </table>
      <p class="confirm-note">Priority is by preference update time; room types
      fill by 1st → 2nd → 3rd choice. Unallotted students appear in the results
      and final PDF without an allotment entry.</p>
    `;
  } catch (e) {
    console.warn("Could not build allotment summary, using default:", e);
  }

  const ok = await showConfirmDialog({
    title: "Lock and Allot",
    message: summaryHtml,
    confirmLabel: "Lock & Allot",
    cancelLabel: "Cancel",
    icon: "🔒",
  });
  if (!ok) return;

  const lockBtn = document.getElementById("lock-allot-btn");
  if (lockBtn) {
    lockBtn.textContent = "Allotting...";
    lockBtn.disabled = true;
  }

  try {
    const response = await fetch("/api/admin/lock-and-allot", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Lock and allot failed");
    }
    document.getElementById("allotment-results").style.display = "block";
    renderResults(data);
    await loadRoomConfig();
    showToast(
      `Allotment completed: ${data.allottedCount} students allotted, ${data.unallottedCount} unallotted. Preferences are now locked.`,
      "success",
      6000
    );
  } catch (error) {
    console.error("Error during lock and allot:", error);
    showToast("Lock and Allot failed: " + error.message, "error", 6000);
  } finally {
    if (lockBtn) {
      lockBtn.textContent = "🔒 Lock and Allot";
      lockBtn.disabled = false;
    }
  }
}

async function resetAllotment() {
  const ok = await showConfirmDialog({
    title: "Reset Allotment",
    message:
      "<p>This deletes <strong>all groups and allotments</strong> and unlocks every student's preferences.</p><p class=\"confirm-note\">The allotment results will be cleared and the warden can run Lock &amp; Allot again.</p>",
    confirmLabel: "Reset Allotment",
    cancelLabel: "Cancel",
    danger: true,
    icon: "↺",
  });
  if (!ok) return;

  try {
    const response = await fetch("/api/admin/reset-allotment", { method: "POST" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Reset failed");
    document.getElementById("allotment-results").style.display = "none";
    await loadRoomConfig();
    showToast("Allotment reset. Preferences are unlocked.", "success");
  } catch (error) {
    console.error("Error resetting allotment:", error);
    showToast("Reset failed: " + error.message, "error");
  }
}

/* ------------------------------------------------------------------ */
/* Admin: results (room-type-wise rooms + unallotted students)         */
/* ------------------------------------------------------------------ */

async function loadAllotmentResults() {
  try {
    const response = await fetch("/api/admin/allotment-results");
    if (!response.ok) throw new Error("Failed to fetch allotment results");
    const data = await response.json();
    renderRoomsByType(data);
    renderUnallottedBlock(data);
  } catch (error) {
    console.error("Error loading allotment results:", error);
  }
}

function renderRoomsByType(data) {
  const container = document.getElementById("rooms-allotted-by-type");
  if (!container) return;
  container.innerHTML = "";

  const hasRooms = (data.roomTypes || []).some((t) => t.rooms.length > 0);
  if (!hasRooms) {
    container.innerHTML = '<p style="text-align: center; color: #64748b;">No rooms allotted yet.</p>';
    return;
  }

  (data.roomTypes || []).forEach((type) => {
    if (type.rooms.length === 0) return;
    const block = document.createElement("div");
    block.className = "room-type-results-block";
    block.innerHTML = `
      <div class="room-type-results-header">
        <strong>${type.roomType}</strong>
        <span class="badge complete">${type.usedRooms} / ${type.totalRooms || 0} rooms used</span>
      </div>
    `;
    const table = document.createElement("table");
    table.className = "modern-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Room #</th>
          <th>Students</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    type.rooms.forEach((room) => {
      const names = (room.students || []).map((s) => `${s.name} (${s.department || "-"})`).join(", ");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>Room #${room.groupId}</strong></td>
        <td>${names || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    block.appendChild(table);
    container.appendChild(block);
  });
}

function renderUnallottedBlock(data) {
  // Unallotted list in the overview card
  const unallottedList = document.getElementById("unallotted-students-details-list");
  if (unallottedList) {
    unallottedList.innerHTML = "";
    if (data.unallotted.length === 0) {
      unallottedList.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #64748b;">No unallotted students.</td></tr>';
    } else {
      data.unallotted.forEach((student) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${student.studentId}</td>
          <td><strong>${student.name}</strong></td>
          <td><span class="badge incomplete">${student.department || "-"} ${student.year || ""}</span></td>
        `;
        unallottedList.appendChild(tr);
      });
    }
  }
  const count = document.getElementById("unallotted-students-count");
  if (count) count.textContent = data.unallottedCount || 0;
}

function renderResults(data) {
  const container = document.getElementById("results-container");
  if (!container) return;
  container.innerHTML = "";

  // Rooms allotted room-type-wise
  (data.roomTypes || []).forEach((type) => {
    if (type.rooms.length === 0) return;
    const block = document.createElement("div");
    block.className = "room-type-results-block";
    block.innerHTML = `
      <div class="room-type-results-header">
        <strong>${type.roomType}</strong>
        <span class="badge complete">${type.usedRooms} / ${type.totalRooms || 0} rooms used</span>
      </div>
    `;
    const table = document.createElement("table");
    table.className = "modern-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Room #</th>
          <th>Students</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    type.rooms.forEach((room) => {
      const names = (room.students || []).map((s) => `${s.name} (${s.department || "-"})`).join(", ");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>Room #${room.groupId}</strong></td>
        <td>${names || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    block.appendChild(table);
    container.appendChild(block);
  });

  // Allotted students (flat list)
  const allottedBlock = document.createElement("div");
  allottedBlock.className = "room-type-results-block allotted-students-block";
  allottedBlock.innerHTML = `
    <div class="room-type-results-header">
      <strong>👥 Allotted Students</strong>
      <span class="badge complete">${data.allottedCount || 0} students</span>
    </div>
  `;
  const aTable = document.createElement("table");
  aTable.className = "modern-table";
  aTable.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Department &amp; Year</th>
        <th>Room</th>
      </tr>
    </thead>
  `;
  const aTbody = document.createElement("tbody");
  (data.roomTypes || []).forEach((type) => {
    type.rooms.forEach((room) => {
      (room.students || []).forEach((s) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${s.studentId}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.department || "-"} (${s.year || "-"})</td>
          <td>${type.roomType} - Room #${room.groupId}</td>
        `;
        aTbody.appendChild(tr);
      });
    });
  });
  if (aTbody.children.length === 0) {
    aTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">No allotted students.</td></tr>';
  }
  aTable.appendChild(aTbody);
  allottedBlock.appendChild(aTable);
  container.appendChild(allottedBlock);

  // Unallotted students
  const unallottedBlock = document.createElement("div");
  unallottedBlock.className = "room-type-results-block unallotted-block";
  unallottedBlock.innerHTML = `
    <div class="room-type-results-header">
      <strong>⚠️ Unallotted Students</strong>
      <span class="badge incomplete">${data.unallottedCount || 0} students</span>
    </div>
  `;
  const uTable = document.createElement("table");
  uTable.className = "modern-table";
  uTable.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Department &amp; Year</th>
        <th>Preferences</th>
      </tr>
    </thead>
  `;
  const uTbody = document.createElement("tbody");
  if ((data.unallotted || []).length === 0) {
    uTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">No unallotted students.</td></tr>';
  } else {
    data.unallotted.forEach((s) => {
      const prefs = (s.preferences || []).filter(Boolean).join(" → ") || "-";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.studentId}</td>
        <td><strong>${s.name}</strong></td>
        <td>${s.department || "-"} (${s.year || "-"})</td>
        <td>${prefs}</td>
      `;
      uTbody.appendChild(tr);
    });
  }
  uTable.appendChild(uTbody);
  unallottedBlock.appendChild(uTable);
  container.appendChild(unallottedBlock);
}

/* ------------------------------------------------------------------ */
/* Admin: stats + track preferences                                    */
/* ------------------------------------------------------------------ */

async function loadAllotmentStats() {
  const allottedCount = document.getElementById("allotted-students-count");
  const allottedList = document.getElementById("allotted-students-details-list");
  const unallottedList = document.getElementById("unallotted-students-details-list");

  try {
    const response = await fetch("/api/admin/allotment-stats");
    if (!response.ok) throw new Error("Failed to fetch statistics");
    const data = await response.json();

    if (allottedCount) allottedCount.textContent = data.allottedCount;
    const unallottedCount = document.getElementById("unallotted-students-count");
    if (unallottedCount) unallottedCount.textContent = data.unallottedCount;

    if (allottedList) {
      allottedList.innerHTML = "";
      if (data.allottedStudents.length === 0) {
        allottedList.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #64748b;">No allotted students found.</td></tr>';
      } else {
        data.allottedStudents.forEach((student) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${student.studentId}</td>
            <td><strong>${student.name}</strong></td>
            <td><span class="badge complete">${student.roomDetails}</span></td>
          `;
          allottedList.appendChild(tr);
        });
      }
    }

    if (unallottedList) {
      unallottedList.innerHTML = "";
      if (data.unallottedStudents.length === 0) {
        unallottedList.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #64748b;">No unallotted students found.</td></tr>';
      } else {
        data.unallottedStudents.forEach((student) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${student.studentId}</td>
            <td><strong>${student.name}</strong></td>
            <td><span class="badge incomplete">${student.category}</span></td>
          `;
          unallottedList.appendChild(tr);
        });
      }
    }
  } catch (error) {
    console.error("Error loading allotment statistics:", error);
  }
}

let allRegisteredStudents = [];

async function loadTrackPreferences() {
  const tableBody = document.getElementById("track-students-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = '<tr><td colspan="6" class="loading" style="text-align: center; padding: 20px;">Loading students...</td></tr>';
  try {
    const response = await fetch("/api/admin/students");
    if (!response.ok) throw new Error("Failed to fetch students");
    allRegisteredStudents = await response.json();

    tableBody.innerHTML = "";
    if (allRegisteredStudents.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="no-data" style="text-align: center; padding: 20px;">No students have filled preferences yet.</td></tr>';
      return;
    }

    allRegisteredStudents.forEach((student, index) => {
      const row = document.createElement("tr");
      const updated = formatDateTime(student.updatedAt);
      row.innerHTML = `
        <td><strong>${student.name}</strong></td>
        <td>${student.department || "-"} (${student.year || "-"})</td>
        <td><span class="badge ${student.location === "chennai" ? "info" : "warning"}" style="text-transform: capitalize; padding: 4px 10px; border-radius: 99px;">${student.location || "-"}</span></td>
        <td>${updated}</td>
        <td><button class="btn secondary small" onclick="viewStudentPreferences(${index})">View Details</button></td>
        <td>${student.email || student.phone || "-"}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading track preferences:", error);
    tableBody.innerHTML = '<tr><td colspan="6" class="error-message" style="text-align: center; color: red; padding: 20px;">Failed to load students.</td></tr>';
  }
}

function filterTrackStudents() {
  const query = document.getElementById("search-students-input").value.toLowerCase();
  const rows = document.querySelectorAll("#track-students-table-body tr");
  rows.forEach((row) => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
  });
}

function viewStudentPreferences(index) {
  const student = allRegisteredStudents[index];
  if (!student) return;

  const content = `
    <div class="preference-details" style="padding: 10px;">
      <h3 style="margin-bottom: 20px; font-family: 'Poppins', sans-serif; font-weight: 700; color: var(--text-color); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">${student.name}'s Preference Details</h3>
      <div class="table-container" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
        <table class="modern-table" style="width: 100%;">
          <tbody>
            <tr><td style="width: 40%; font-weight: 600;">Email</td><td>${student.email || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Phone</td><td>${student.phone || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Department & Year</td><td>${student.department || "-"} (${student.year || "-"})</td></tr>
            <tr><td style="font-weight: 600;">Location</td><td>${student.location || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Sleep / Wake Time</td><td>${student.sleepTime || "-"} / ${student.wakeTime || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Preferred Noise Level</td><td>${student.noiseLevel || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Light Sensitivity</td><td>${student.lightSensitivity || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Study Habit & Time</td><td>${student.studyHabits || "-"} (${student.studyTime || "-"})</td></tr>
            <tr><td style="font-weight: 600;">Cleanliness Level</td><td>${student.cleanliness || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Room Type Preferences</td><td>${[student.roomTypePref1, student.roomTypePref2, student.roomTypePref3].filter(Boolean).join(" → ") || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Preferred Roommates</td><td>${student.preferredRoommates || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Created At</td><td>${formatDateTime(student.createdAt)}</td></tr>
            <tr><td style="font-weight: 600;">Last Updated</td><td>${formatDateTime(student.updatedAt)}</td></tr>
            <tr><td style="font-weight: 600;">Emergency Contact</td><td>${student.emergencyContact || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Home Address</td><td>${student.address || "-"}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const template = document.getElementById("modal-template");
  if (!template) return;
  const clone = template.content.cloneNode(true);
  const modal = clone.querySelector(".modal");
  const modalBody = clone.querySelector(".modal-body");
  modalBody.innerHTML = content;
  document.body.appendChild(modal);
  modal.querySelector(".modal-close").addEventListener("click", () => modal.remove());
}

/* ------------------------------------------------------------------ */
/* Student: profile + allotment status                                 */
/* ------------------------------------------------------------------ */

function formatDateTime(value) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString();
  } catch (e) {
    return value;
  }
}

/** Gates the student preference form by the warden's preference window and
 *  the post-allotment lock: disabled while the window is closed or locked. */
function setStudentFormState({ preferencesOpen, locked }) {
  const notOpen = !preferencesOpen && !locked;
  const disabled = locked || notOpen;

  const notOpenBanner = document.getElementById("preferences-not-open-banner");
  if (notOpenBanner) notOpenBanner.style.display = notOpen ? "block" : "none";
  const lockedBanner = document.getElementById("preferences-locked-banner");
  if (lockedBanner) lockedBanner.style.display = locked ? "block" : "none";

  const form = document.getElementById("student-pref-form");
  if (form) {
    const inputs = form.querySelectorAll("input, select, textarea, button[type='submit']");
    inputs.forEach((el) => {
      el.disabled = disabled;
    });
  }
  const formLink = document.getElementById("link-student-form");
  if (formLink) {
    formLink.style.pointerEvents = disabled ? "none" : "auto";
    formLink.style.opacity = disabled ? "0.4" : "1";
    formLink.title = locked ? "Preferences are locked after room allotment." : notOpen ? "Preference selection has not opened yet." : "";
  }
  const profileBtn = document.querySelector(".js-profile-action-btn");
  if (profileBtn) {
    if (disabled) {
      profileBtn.textContent = locked ? "Preferences Locked" : "Not Opened Yet";
      profileBtn.disabled = true;
      profileBtn.removeAttribute("onclick");
      profileBtn.style.opacity = "0.6";
      profileBtn.style.cursor = "not-allowed";
    } else {
      profileBtn.textContent = "Edit Profile";
      profileBtn.disabled = false;
      profileBtn.setAttribute("onclick", "document.getElementById('link-student-form').click()");
      profileBtn.style.opacity = "1";
      profileBtn.style.cursor = "pointer";
    }
  }
}

async function loadStudentAllotment() {
  const badge = document.getElementById("allotment-status-badge");
  const container = document.getElementById("allotment-details-container");
  const roomInfo = document.getElementById("allotted-room-info");
  const roommatesList = document.getElementById("allotted-roommates-list");
  if (!badge) return;

  try {
    const response = await fetch("/api/student/allotment");
    if (!response.ok) throw new Error("Failed to fetch allotment status");
    const data = await response.json();

    if (data.allotted) {
      badge.classList.remove("incomplete");
      badge.classList.add("complete");
      badge.textContent = "Allotted";
      setStudentFormState({ preferencesOpen: data.preferencesOpen !== false, locked: true });

      if (roomInfo) {
        roomInfo.textContent = `${data.roomType} (Room #${data.groupId})`;
      }

      if (roommatesList) {
        roommatesList.innerHTML = "";
        if (data.roommates && data.roommates.length > 0) {
          data.roommates.forEach((mate) => {
            const li = document.createElement("li");
            li.style.padding = "8px 0";
            li.style.borderBottom = "1px solid var(--border-color)";
            li.innerHTML = `
              <div style="font-weight: 600; color: var(--text-color);">${mate.name}</div>
              <div style="font-size: 0.85rem; color: #64748b;">${mate.department || "-"} (${mate.year || "-"})</div>
              <div style="font-size: 0.85rem; color: #64748b;">Contact: ${mate.email || mate.phone || "-"}</div>
            `;
            roommatesList.appendChild(li);
          });
        } else {
          roommatesList.innerHTML = '<li style="color: #64748b; font-size: 0.9rem; padding: 4px 0;">No roommates assigned yet.</li>';
        }
      }
      if (container) container.style.display = "block";
    } else {
      badge.classList.remove("complete");
      badge.classList.add("incomplete");
      badge.textContent = data.locked ? "Not Allotted" : "Not Allotted";
      setStudentFormState({ preferencesOpen: data.preferencesOpen !== false, locked: !!data.locked });

      if (container) container.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading allotment status:", error);
    badge.textContent = "Error";
    if (container) container.style.display = "none";
  }
}

async function loadStudentProfile() {
  try {
    await showRooms();
    const response = await fetch("/api/student/profile", { method: "GET", credentials: "include" });
    if (response.ok) {
      const data = await response.json();

      const badge = document.querySelector("#student-overview .status-row .badge");
      if (badge) {
        badge.classList.remove("incomplete");
        badge.classList.add("complete");
        badge.textContent = "Complete";
      }

      const updatedTime = document.getElementById("profile-updated-time");
      if (updatedTime) updatedTime.textContent = formatDateTime(data.updatedAt);

      const lastUpdated = document.getElementById("form-last-updated");
      if (lastUpdated) {
        lastUpdated.textContent = `Created: ${formatDateTime(data.createdAt)} · Last updated: ${formatDateTime(data.updatedAt)}`;
      }

      document.querySelector(".js-name").value = data.name || "";
      document.querySelector(".js-clg").value = data.clg === "Shiv Nadar University" ? "snu" : "ssn";
      document.querySelector(".js-sleep").value = data.sleepTime || "";
      document.querySelector(".js-wake").value = data.wakeTime || "";
      document.querySelector(".js-department").value = data.department || "";
      document.querySelector(".js-year").value = data.year || "";
      document.querySelector(".js-phone").value = data.phone || "";
      document.querySelector(".js-studentId").value = data.studentId || "";
      document.querySelector(".js-study").value = data.studyTime || "";
      document.querySelector(".js-room-pref1").value = data.roomTypePref1 || "";
      document.querySelector(".js-room-pref2").value = data.roomTypePref2 || "";
      document.querySelector(".js-room-pref3").value = data.roomTypePref3 || "";
      document.querySelector(".js-home").value = data.address || "";
      document.querySelector(".js-emergency").value = data.emergencyContact || "";
      document.querySelector(".js-friends").value = data.preferredRoommates || "";
      document.querySelector(".js-studyHabbits").value = data.studyHabits || "";
      document.querySelector(".js-clean").value = data.cleanliness || "";
      document.querySelector(".js-light").value = data.lightSensitivity || "";
      document.querySelector(".js-noise").value = data.noiseLevel || "";
      document.querySelector(".js-location").value = data.location || "";
    }
  } catch (error) {
    console.error("Error loading student profile:", error);
  }
}

/* ------------------------------------------------------------------ */
/* PDF export                                                          */
/* ------------------------------------------------------------------ */

/** Strips characters jsPDF's built-in fonts cannot render (emoji, arrows,
 *  control chars) so PDF text never shows mojibake like "Ø=Üe". */
function sanitizePdfText(text) {
  return String(text)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/[\u{0000}-\u{001F}\u{007F}]/gu, "")
    .trim();
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(26, 82, 118);
  doc.rect(0, 0, 210, 40, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Roommate Harmony Allotment Chart", 15, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(220, 220, 220);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 33);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text("Rooms Allotted (Room Type wise) + Unallotted Students", 15, 50);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 55, 195, 55);

  let y = 62;
  const roomTypeBlocks = document.querySelectorAll("#results-container .room-type-results-block");
  let firstTable = true;

  roomTypeBlocks.forEach((block) => {
    const headerEl = block.querySelector(".room-type-results-header");
    const tableEl = block.querySelector("table");
    if (!headerEl || !tableEl) return;

    const headerText = sanitizePdfText(headerEl.textContent.replace(/\s+/g, " "));
    const isUnallotted = block.classList.contains("unallotted-block");
    const isAllottedList = block.classList.contains("allotted-students-block");

    if (!firstTable) {
      doc.addPage();
      y = 20;
    }
    firstTable = false;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(26, 82, 118);
    doc.text(headerText, 15, y);
    y += 5;

    const head = isUnallotted
      ? [["ID", "Name", "Department & Year", "Preferences"]]
      : isAllottedList
        ? [["ID", "Name", "Department & Year", "Room"]]
        : [["Room #", "Students"]];
    const body = [];
    tableEl.querySelectorAll("tbody tr").forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((c) => sanitizePdfText(c.textContent));
      if (cells.length > 0) {
        body.push(cells);
      }
    });

    doc.autoTable({
      startY: y,
      head: head,
      body: body,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });
    y = doc.lastAutoTable.finalY + 12;
  });

  if (firstTable) {
    doc.text("No allotment results to display.", 15, 72);
  }

  doc.save(`allotment_chart_${new Date().toISOString().slice(0, 10)}.pdf`);
}
