document
  .querySelector(".js-submitIt")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const tym = new Date().toISOString();
    const name = document.querySelector(".js-name").value;
    const clg = document.querySelector(".js-clg").value;
    const sleep = document.querySelector(".js-sleep").value;
    const wake = document.querySelector(".js-wake").value;
    const department = document.querySelector(".js-department").value;
    const year = document.querySelector(".js-year").value;
    const phone = document.querySelector(".js-phone").value;
    const studentId = Number(document.querySelector(".js-studentId").value);
    const studyTime = document.querySelector(".js-study").value;
    const room = document.querySelector(".js-room").value;
    const address = document.querySelector(".js-home").value;
    const emergencyContact = document.querySelector(".js-emergency").value;
    const roomMates = document.querySelector(".js-friends").value;
    const studyHabbits = document.querySelector(".js-studyHabbits").value;
    const clean = document.querySelector(".js-clean").value;
    const light = document.querySelector(".js-light").value;
    const noise = document.querySelector(".js-noise").value;
    const location = document.querySelector(".js-location").value;

    // Map the clg value to the full name expected by the backend
    const clgFullName = clg === "ssn" ? "SSN College" : "Shiv Nadar University";

    const payload = {
      name: name,
      clg: clgFullName, // Use the full name for the backend
      sleepTime: sleep,
      wakeTime: wake,
      department: department,
      year: year,
      phone: phone,
      studentId: studentId,
      studyTime: studyTime,
      roomType: room,
      address: address,
      emergencyContact: emergencyContact,
      preferredRoommates: roomMates,
      studyHabits: studyHabbits,
      cleanliness: clean,
      lightSensitivity: light,
      noiseLevel: noise,
      submittedTime: tym,
      location: location,
    };

    try {
      const response = await fetch("/saveStudents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      alert("Preferences saved successfully!");
      await loadStudentProfile(); // Refresh status badge & pre-fill fields
      switchSection("student-overview", document.getElementById("link-student-overview"));
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save preferences. Please try again.");
    }
  });

function allotRooms() {
  const category = document.getElementById("category").value;
  const roomTypeSelect = document.getElementById("allot-room-type");
  const roomType = roomTypeSelect.value;
  const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
  const capacity = selectedOption ? parseInt(selectedOption.getAttribute("data-capacity") || "3") : 3;

  const numStudents = document.getElementById("num-students").value;
  const location = document.getElementById("allot-location").value;
  if (!(location && category && roomType && numStudents)) {
    alert("Please fill all details (Location, Category, Room Type, and Number of Students)");
    return false;
  }

  // Show loading state
  const allotBtn = document.querySelector('.dashboard-card .btn.primary[onclick="allotRooms()"]');
  if (allotBtn) {
    allotBtn.textContent = "Allotting...";
    allotBtn.disabled = true;
  }

  document.getElementById("allotment-results").style.display = "none";

  fetch("/allot_roommates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: location,
      category: category,
      roomType: roomType,
      numStudents: numStudents,
      capacity: capacity
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message || `HTTP error! status: ${response.status}`);
        }).catch(() => {
          throw new Error(`HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      // Show the message from backend
      if (data.message) {
        window.alert(data.message);
      }
      
      // Display the allotment results
      if (data.groups && data.groups.length > 0) {
        const resultsContainer = document.getElementById("results-container");
        resultsContainer.innerHTML = "";
        
        const tableResponsive = document.createElement("div");
        tableResponsive.className = "table-responsive";
        
        const table = document.createElement("table");
        table.className = "modern-table";
        
        let tableHeader = `
          <thead>
            <tr>
              <th>Group</th>
              <th>Student 1</th>
              <th>Student 2</th>
              <th>Student 3</th>
              <th>Student 4</th>
            </tr>
          </thead>
        `;
        table.innerHTML = tableHeader;
        
        const tbody = document.createElement("tbody");
        data.groups.forEach((group, index) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>Group ${index + 1}</strong></td>
            <td>${group.student_1 || "-"}</td>
            <td>${group.student_2 || "-"}</td>
            <td>${group.student_3 || "-"}</td>
            <td>${group.student_4 || "-"}</td>
          `;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableResponsive.appendChild(table);
        resultsContainer.appendChild(tableResponsive);
        
        // Show results section
        document.getElementById("allotment-results").style.display = "block";
      } else if (data.message && !data.groups) {
        // No groups but message exists (error or info)
        document.getElementById("results-container").innerHTML = `<div class="info-message">${data.message}</div>`;
        document.getElementById("allotment-results").style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Allotment failed: " + error.message);
      document.getElementById("results-container").innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
      document.getElementById("allotment-results").style.display = "block";
    })
    .finally(() => {
      if (allotBtn) {
        allotBtn.textContent = "Allot Rooms";
        allotBtn.disabled = false;
      }
    });
}

function showDashboard() {
  showStudentDashboard();
}

function showLanding() {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById("landing-page").classList.add("active");

  // Clear any stored session data
  clearSessionData();
}

// Function to handle logout
function handleLogout() {
  // Clear session data
  clearSessionData();

  // Redirect to logout endpoint
  window.location.href = "/logout";
}

function showPreferences() {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById("preferences-page").classList.add("active");
  // Populate department dropdown when preferences page is shown
  getDepartmentFromCategories();
}

function showAddCategoryModal() {
  const modalTemplate = document
    .getElementById("modal-template")
    .content.cloneNode(true);
  modalTemplate.querySelector(".modal-body").innerHTML = `
          <h3>Add Category</h3>
          <form class="form">
            <div class="form-group">
              <label for="category-name">Category Name</label>
              <select id="category-college" class="form-input">
                <option value="">-- Select College --</option>
                <option value="ssn">SSN</option>
                <option value="snu">SNU</option>
              </select>
              <input type ="text" placeholder ="Department" id="category-department" class="form-input"/>
              <select id="category-year" class="form-input">
                <option value="">-- Select Year --</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
                <option value="5th">5th</option>
              </select>
            </div>
            <button onclick="addCategory()" class="btn primary">Add Category</button>
          </form>
        `;
  document.body.appendChild(modalTemplate);
  attachModalClose();
}

async function showCategory() {
  try {
    const response = await fetch("/get-category");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const categories = await response.json();
    const categoryList = document.getElementById("category-list");

    // Clear existing content
    categoryList.innerHTML = "";
    console.log(categories);

    // Add each category to the list
    categories.forEach((category) => {
      const categoryItem = document.createElement("div");
      categoryItem.className = "category-item";

      // Use the category value directly without parsing
      const categoryValue = category.category || "";

      categoryItem.innerHTML = `
        <span> > Category Name : ${categoryValue}</span>
        <div class="category-actions">
          <button class="btn secondary small" onclick="showEditCategoryModal(${category.id}, '${categoryValue}')">Edit</button>
          <button class="btn secondary small remove" onclick="removeCategory(${category.id})">Remove</button>
        </div>
      `;
      categoryList.appendChild(categoryItem);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    const categoryList = document.getElementById("category-list");
    categoryList.innerHTML =
      '<div class="error-message">Failed to load categories. Please try again later.</div>';
  }
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", function () {
  showCategory();
  showRooms();
  checkUserRoleAndShowDashboard();
  sendRoomAndHostel();
});

// Call this function after adding, editing, or removing a category
function refreshCategories() {
  showCategory();
}

// Function to check user role and show appropriate dashboard
async function checkUserRoleAndShowDashboard() {
  try {
    // Check if user is authenticated by trying to access user info
    const response = await fetch("/api/user-info", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const userInfo = await response.json();
      console.log("User info:", userInfo);

      if (userInfo.authenticated) {
        const role = userInfo.role;
        console.log("User role:", role);

        // Store user info in session storage for cross-tab communication
        sessionStorage.setItem("userRole", role);
        sessionStorage.setItem("userEmail", userInfo.email);
        sessionStorage.setItem("isAuthenticated", "true");

        if (role === "ADMIN") {
          showAdminDashboard();
        } else if (role === "STUDENT") {
          showStudentDashboard();
          loadStudentProfile();
        } else {
          showLanding();
        }
      } else {
        // User not authenticated, clear session and show landing page
        clearSessionData();
        showLanding();
      }
    } else {
      // User not authenticated, clear session and show landing page
      clearSessionData();
      showLanding();
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    // On error, clear session and show landing page
    clearSessionData();
    showLanding();
  }
}

// Function to clear session data
function clearSessionData() {
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
}

function switchSection(sectionId, element) {
  // Hide all content sections
  document.querySelectorAll(".content-section").forEach((sec) => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

  // Close mobile sidebar if open
  const sidebar = document.querySelector(".app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && sidebar.classList.contains("mobile-open")) {
    sidebar.classList.remove("mobile-open");
    if (overlay) overlay.style.display = "none";
  }

  // Show the selected section
  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  // Update nav-link active class
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  if (element) {
    element.classList.add("active");
  } else {
    // Attempt to locate link by sectionId
    const activeLink = document.getElementById(`link-${sectionId}`);
    if (activeLink) activeLink.classList.add("active");
  }

  // Specific triggers for certain sections
  if (sectionId === "admin-tracking") {
    loadTrackPreferences();
  } else if (sectionId === "admin-categories") {
    showCategory();
  } else if (sectionId === "admin-rooms") {
    showRooms();
  } else if (sectionId === "admin-allotment") {
    showCategoryForm();
  } else if (sectionId === "admin-overview") {
    loadAllotmentHistory();
    loadAllotmentStats();
  }
}

function showAdminDashboard() {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  const appContainer = document.getElementById("app-container");
  if (appContainer) appContainer.classList.add("active");

  const badge = document.getElementById("user-role-badge");
  if (badge) badge.textContent = "Admin";

  document.querySelectorAll(".admin-only").forEach(el => el.style.display = "");
  document.querySelectorAll(".student-only").forEach(el => el.style.display = "none");

  switchSection("admin-overview", document.getElementById("link-admin-overview"));
  loadAllotmentHistory();
  loadAllotmentStats();
}

async function loadAllotmentHistory() {
  const historyList = document.getElementById("allotment-history-list");
  if (!historyList) return;

  try {
    const response = await fetch("/api/admin/allotments");
    if (!response.ok) throw new Error("Failed to fetch allotment history");
    const data = await response.json();

    historyList.innerHTML = "";
    if (data.length === 0) {
      historyList.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: #64748b; padding: 20px;">No rooms have been allotted yet.</td>
        </tr>
      `;
    } else {
      data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>#${item.id}</strong></td>
          <td>${item.date}</td>
          <td><span class="badge incomplete">${item.category || "All"}</span></td>
          <td><span class="badge complete">${item.roomType}</span></td>
          <td><strong>${item.studentCount} students</strong></td>
          <td>
            <button class="btn secondary small" onclick="downloadRunPDF(${item.id}, '${item.category || "All"}', '${item.roomType}', '${item.location || "both"}')">📄 PDF Chart</button>
          </td>
        `;
        historyList.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("Error loading allotment history:", error);
    historyList.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #ef4444; padding: 20px;">Error loading allotment history. Please try again.</td>
      </tr>
    `;
  }
}

function showStudentDashboard() {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  const appContainer = document.getElementById("app-container");
  if (appContainer) appContainer.classList.add("active");

  const badge = document.getElementById("user-role-badge");
  if (badge) badge.textContent = "Student";

  document.querySelectorAll(".student-only").forEach(el => el.style.display = "");
  document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");

  switchSection("student-overview", document.getElementById("link-student-overview"));
  loadStudentAllotment();
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

      const profileBtn = document.querySelector(".js-profile-action-btn");
      if (profileBtn) {
        profileBtn.textContent = "Preferences Locked";
        profileBtn.disabled = true;
        profileBtn.removeAttribute("onclick");
        profileBtn.style.opacity = "0.6";
        profileBtn.style.cursor = "not-allowed";
      }

      const formLink = document.getElementById("link-student-form");
      if (formLink) {
        formLink.style.pointerEvents = "none";
        formLink.style.opacity = "0.4";
        formLink.title = "Preferences are locked after room allotment.";
      }

      if (roomInfo) {
        roomInfo.textContent = `${data.roomType} (Room ID: ${data.roomId})`;
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
      badge.textContent = "Not Allotted";

      const profileBtn = document.querySelector(".js-profile-action-btn");
      if (profileBtn) {
        profileBtn.textContent = "Edit Profile";
        profileBtn.disabled = false;
        profileBtn.setAttribute("onclick", "document.getElementById('link-student-form').click()");
        profileBtn.style.opacity = "1";
        profileBtn.style.cursor = "pointer";
      }

      const formLink = document.getElementById("link-student-form");
      if (formLink) {
        formLink.style.pointerEvents = "auto";
        formLink.style.opacity = "1";
        formLink.removeAttribute("title");
      }

      if (container) container.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading allotment status:", error);
    badge.textContent = "Error";
    if (container) container.style.display = "none";
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
      row.innerHTML = `
        <td><strong>${student.name}</strong></td>
        <td>${student.clg === "snu" || student.clg === "Shiv Nadar University" ? "Shiv Nadar University" : "SSN College"}</td>
        <td>${student.department || "-"} (${student.studentYear || "-"})</td>
        <td><span class="badge ${student.location === "chennai" ? "info" : "warning"}" style="text-transform: capitalize; padding: 4px 10px; border-radius: 99px;">${student.location || "-"}</span></td>
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
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? "" : "none";
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
            <tr><td style="font-weight: 600;">College</td><td>${student.clg === "snu" || student.clg === "Shiv Nadar University" ? "Shiv Nadar University" : "SSN College"}</td></tr>
            <tr><td style="font-weight: 600;">Department & Year</td><td>${student.department || "-"} (${student.studentYear || "-"})</td></tr>
            <tr><td style="font-weight: 600;">Location</td><td>${student.location || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Sleep / Wake Time</td><td>${student.sleepTime || "-"} / ${student.wakeTime || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Preferred Noise Level</td><td>${student.noiseLevel || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Light Sensitivity</td><td>${student.lightSensitivity || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Study Habit & Time</td><td>${student.studyHabits || "-"} (${student.studyTime || "-"})</td></tr>
            <tr><td style="font-weight: 600;">Cleanliness Level</td><td>${student.cleanliness || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Preferred Room Type</td><td>${student.roomType || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Preferred Roommates</td><td>${student.preferredRoommates || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Emergency Contact</td><td>${student.emergencyContact || "-"}</td></tr>
            <tr><td style="font-weight: 600;">Home Address</td><td>${student.address || "-"}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Create and show modal
  const template = document.getElementById("modal-template");
  if (!template) return;
  const clone = template.content.cloneNode(true);
  const modal = clone.querySelector(".modal");
  const modalBody = clone.querySelector(".modal-body");
  modalBody.innerHTML = content;

  // Append modal to body
  document.body.appendChild(modal);

  // Bind close buttons
  const closeBtn = modal.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => {
    modal.remove();
  });
}

async function loadStudentProfile() {
  try {
    // Make sure options are populated before setting values
    await showRooms();
    await getDepartmentFromCategories();

    const response = await fetch("/api/student/profile", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Loaded student profile:", data);

      // Update dashboard status badge
      const badge = document.querySelector("#student-overview .status-row .badge");
      if (badge) {
        badge.classList.remove("incomplete");
        badge.classList.add("complete");
        badge.textContent = "Complete";
      }

      // Update button text to "Edit Profile"
      const profileBtn = document.querySelector(".js-profile-action-btn");
      if (profileBtn) {
        profileBtn.textContent = "Edit Profile";
      }

      // Pre-fill form fields
      const nameInput = document.querySelector(".js-name");
      if (nameInput) nameInput.value = data.name || "";

      const clgInput = document.querySelector(".js-clg");
      if (clgInput) {
        clgInput.value = data.clg === "Shiv Nadar University" ? "snu" : "ssn";
      }
      
      const sleepInput = document.querySelector(".js-sleep");
      if (sleepInput) sleepInput.value = data.sleepTime || "";
      
      const wakeInput = document.querySelector(".js-wake");
      if (wakeInput) wakeInput.value = data.wakeTime || "";
      
      const departmentInput = document.querySelector(".js-department");
      if (departmentInput) departmentInput.value = data.department || "";
      
      const yearInput = document.querySelector(".js-year");
      if (yearInput) yearInput.value = data.year || "";
      
      const phoneInput = document.querySelector(".js-phone");
      if (phoneInput) phoneInput.value = data.phone || "";
      
      const studentIdInput = document.querySelector(".js-studentId");
      if (studentIdInput) studentIdInput.value = data.studentId || "";
      
      const studyTimeInput = document.querySelector(".js-study");
      if (studyTimeInput) studyTimeInput.value = data.studyTime || "";
      
      const roomInput = document.querySelector(".js-room");
      if (roomInput) roomInput.value = data.roomType || "";
      
      const addressInput = document.querySelector(".js-home");
      if (addressInput) addressInput.value = data.address || "";
      
      const emergencyInput = document.querySelector(".js-emergency");
      if (emergencyInput) emergencyInput.value = data.emergencyContact || "";
      
      const matesInput = document.querySelector(".js-friends");
      if (matesInput) matesInput.value = data.preferredRoommates || "";
      
      const studyHabitsInput = document.querySelector(".js-studyHabbits");
      if (studyHabitsInput) studyHabitsInput.value = data.studyHabits || "";
      
      const cleanInput = document.querySelector(".js-clean");
      if (cleanInput) cleanInput.value = data.cleanliness || "";
      
      const lightInput = document.querySelector(".js-light");
      if (lightInput) lightInput.value = data.lightSensitivity || "";
      
      const noiseInput = document.querySelector(".js-noise");
      if (noiseInput) noiseInput.value = data.noiseLevel || "";
      
      const locationInput = document.querySelector(".js-location");
      if (locationInput) locationInput.value = data.location || "";
    } else {
      // Profile not found, reset to Incomplete state
      const badge = document.querySelector("#dashboard-page .status-row .badge");
      if (badge) {
        badge.classList.remove("complete");
        badge.classList.add("incomplete");
        badge.textContent = "Incomplete";
      }

      const profileBtn = document.querySelector('#dashboard-page a[onclick="showPreferences()"]');
      if (profileBtn) {
        profileBtn.textContent = "Complete Profile";
      }
    }
  } catch (error) {
    console.error("Error loading student profile:", error);
  }
}
async function addCategory() {
  const clg = document.getElementById("category-college").value;
  const department = document.getElementById("category-department").value;
  const year = document.getElementById("category-year").value;
  const category = clg + "-" + department + "-" + year;

  if (!(clg && department && year)) {
    alert("Please fill all details");
    return false;
  }

  console.log(category);
  const request = await fetch("/save-category", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });
  console.log(request.status);
  refreshCategories();
}

async function removeCategory(id) {
  try {
    const response = await fetch(`/delete-category/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.status}`);
    }
    refreshCategories();
  } catch (error) {
    console.error("Error removing category:", error);
    alert("Failed to remove category. Please try again.");
  }
}


function showEditCategoryModal() {
  const modalTemplate = document
    .getElementById("modal-template")
    .content.cloneNode(true);
  modalTemplate.querySelector(".modal-body").innerHTML = `
          <h3>Edit Category</h3>
          <form class="form">
            <div class="form-group">
              <label for="category-name">Category Name</label>
              <input id="category-name" type="text" class="form-input" value="1st Year SSN Students" />
            </div>
            <button type="submit" class="btn primary">Save Changes</button>
          </form>
        `;
  document.body.appendChild(modalTemplate);
  attachModalClose();
}

function showAddRoomTypeModal() {
  const modalTemplate = document
    .getElementById("modal-template")
    .content.cloneNode(true);
  modalTemplate.querySelector(".modal-body").innerHTML = `
          <h3>Add Room Type</h3>
          <form class="form">
            <div class="form-group">
              <label for="room-type-name">Room Type Name</label>
              <input id="room-type-name" type="text" class="form-input" placeholder="e.g., Triple Sharing" />
            </div>
            <div class="form-group">
              <label for="allowed-categories">Allowed Categories</label>
              <select id="allowed-categories" class="form-select" multiple>
                <option value="1st-year">1st Year SSN Students</option>
                <option value="3rd-year">3rd Year SSN Students</option>
              </select>
            </div>
            <button type="submit" class="btn primary">Add Room Type</button>
          </form>
        `;
  document.body.appendChild(modalTemplate);
  attachModalClose();
}

function showEditRoomTypeModal() {
  const modalTemplate = document
    .getElementById("modal-template")
    .content.cloneNode(true);
  modalTemplate.querySelector(".modal-body").innerHTML = `
          <h3>Edit Room Type</h3>
          <form class="form">
            <div class="form-group">
              <label for="room-type-name">Room Type Name</label>
              <input id="room-type-name" type="text" class="form-input" value="Single Room" />
            </div>
            <div class="form-group">
              <label for="allowed-categories">Allowed Categories</label>
              <select id="allowed-categories" class="form-select" multiple>
                <option value="1st-year">1st Year SSN Students</option>
                <option value="3rd-year" selected>3rd Year SSN Students</option>
              </select>
            </div>
            <button type="submit" class="btn primary">Save Changes</button>
          </form>
        `;
  document.body.appendChild(modalTemplate);
  attachModalClose();
}

async function showCategoryForm() {
  const categorySelect = document.getElementById("category");
  // Clear existing options except the placeholder
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  try {
    const response = await fetch("/get-category");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const categories = await response.json();
    // Generate options for each combination
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.category;
      option.text = category.category.toUpperCase();
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

function attachModalClose() {
  const closeBtn = document.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => {
    const modal = closeBtn.closest(".modal");
    modal.remove();
  });
}
// Show rooms dynamically in the admin panel and refresh all room-type dropdowns
async function showRooms() {
  try {
    const response = await fetch("/get-rooms");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const rooms = await response.json();

    // Populate admin room-type list
    const roomList = document.getElementById("room-type-list");
    if (roomList) {
      roomList.innerHTML = "";
      if (rooms.length === 0) {
        roomList.innerHTML = '<div class="error-message">No room types added yet.</div>';
      } else {
        rooms.forEach((room) => {
          const item = document.createElement("div");
          item.className = "room-type-item";
          item.innerHTML = `
            <span><strong>${room.roomType}</strong> (${room.capacity || 3} members)</span>
            <div class="room-type-actions">
              <button class="btn secondary small remove" onclick="removeRoom(${room.roomId}, '${room.roomType}')">Remove</button>
            </div>
          `;
          roomList.appendChild(item);
        });
      }
    }

    // Populate room-type dropdowns (student form + allot form)
    let roomHTML = "";
    rooms.forEach((room) => {
      roomHTML += `<option value="${room.roomType}" data-capacity="${room.capacity || 3}">${room.roomType} (${room.capacity || 3} members)</option>`;
    });

    const studentRoomSelect = document.querySelector(".js-room");
    if (studentRoomSelect) studentRoomSelect.innerHTML = roomHTML || '<option value="">No room types available</option>';

    const allotRoomSelect = document.querySelector(".js-allot-room-type");
    if (allotRoomSelect) allotRoomSelect.innerHTML = roomHTML || '<option value="">No room types available</option>';

  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}

async function removeRoom(id, roomType) {
  if (!confirm(`Are you sure you want to remove room type "${roomType}"?`)) return;
  try {
    const response = await fetch(`/remove-room/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Failed to delete room type: ${response.status}`);
    showRooms();
  } catch (error) {
    console.error("Error removing room:", error);
    alert("Failed to remove room type. Please try again.");
  }
}

// Populate department dropdown from categories (deduplicated)
async function getDepartmentFromCategories() {
  try {
    const response = await fetch("/get-category");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const categories = await response.json();

    // Use a Set to deduplicate departments
    const deptSet = new Set();
    categories.forEach((cat) => {
      const values = cat.category.split("-");
      const department = (values[1] || cat.category).toUpperCase();
      if (department) deptSet.add(department);
    });

    // Build HTML with a default option first, then deduplicated departments
    let departmentHTML = '<option value="">-- Select Department --</option>';
    deptSet.forEach((dept) => {
      departmentHTML += `<option value="${dept}">${dept}</option>`;
    });

    const selectForm = document.querySelector(".js-department");
    if (selectForm) {
      selectForm.innerHTML = departmentHTML || '<option value="">No categories added yet</option>';
    }
  } catch (error) {
    console.error("Error loading departments:", error);
    const selectForm = document.querySelector(".js-department");
    if (selectForm) {
      selectForm.innerHTML = '<option value="">Failed to load departments</option>';
    }
  }
}

function sendRoomAndHostel() {
  const addButton = document.querySelector(".js-add-button");
  if (!addButton) return;
  addButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const name = document.querySelector(".js-getHostel").value;
    const capacityInput = document.querySelector(".js-getRoomCapacity");
    const capacity = capacityInput ? parseInt(capacityInput.value) : 3;
    if (!name) {
      alert("Please fill room type name.");
      return;
    }
    const obj = { name, capacity };

    try {
      const response = await fetch("/room-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
      });
      const getResponse = await response.json();
      console.log(getResponse);
      // Clear inputs
      document.querySelector(".js-getHostel").value = "";
      if (capacityInput) capacityInput.value = "3";
      // Refresh lists
      showRooms();
    } catch (error) {
      console.error("Error adding room type:", error);
      alert("Failed to add room type.");
    }
  });
}

function handleLoginWithAccountChooser() {
  // Force Google to show account chooser
  const googleAuthUrl = "/oauth2/authorization/google?prompt=select_account";
  window.location.href = googleAuthUrl;
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add Header/Banner
  doc.setFillColor(26, 82, 118); // Elegant Navy Blue
  doc.rect(0, 0, 210, 40, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Roommate Harmony Allotment Chart", 15, 25);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(220, 220, 220);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 33);

  // Info Section
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  const category = document.getElementById("category")?.value || "All";
  const roomType = document.getElementById("allot-room-type")?.value || "All";
  const location = document.getElementById("allot-location")?.value || "All";
  
  doc.text(`Location: ${location.toUpperCase()}`, 15, 52);
  doc.text(`Category: ${category}`, 80, 52);
  doc.text(`Room Type: ${roomType}`, 145, 52);

  // Line Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 57, 195, 57);

  // Gather Table Data from DOM
  const tableRows = [];
  const resultsContainer = document.getElementById("results-container");
  const rows = Array.from(resultsContainer.querySelectorAll("tbody tr"));

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    if (cells.length >= 5) {
      tableRows.push([
        cells[0].textContent.trim(),
        cells[1].textContent.trim(),
        cells[2].textContent.trim(),
        cells[3].textContent.trim(),
        cells[4].textContent.trim()
      ]);
    }
  });

  // Generate Table using jsPDF AutoTable plugin
  doc.autoTable({
    startY: 63,
    head: [["Group", "Student 1", "Student 2", "Student 3", "Student 4"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185], // Vibrant blue header
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250] // Subtle grey/blue for striped rows
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    }
  });

  // Save the PDF file
  doc.save(`allotment_chart_${category}_${roomType}.pdf`);
}

function toggleDetailsList(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    if (container.style.display === "none") {
      container.style.display = "block";
    } else {
      container.style.display = "none";
    }
  }
}

async function loadAllotmentStats() {
  const allottedCount = document.getElementById("allotted-students-count");
  const unallottedCount = document.getElementById("unallotted-students-count");
  const allottedList = document.getElementById("allotted-students-details-list");
  const unallottedList = document.getElementById("unallotted-students-details-list");

  if (!allottedCount) return;

  try {
    const response = await fetch("/api/admin/allotment-stats");
    if (!response.ok) throw new Error("Failed to fetch statistics");
    const data = await response.json();

    allottedCount.textContent = data.allottedCount;
    unallottedCount.textContent = data.unallottedCount;

    // Populate allotted list
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

    // Populate unallotted list
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

async function downloadRunPDF(runId, category, roomType, location) {
  try {
    const response = await fetch(`/api/admin/allotment-run/${runId}/groups`);
    if (!response.ok) throw new Error("Failed to fetch run allotment details");
    const groups = await response.json();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Header/Banner
    doc.setFillColor(26, 82, 118); // Elegant Navy Blue
    doc.rect(0, 0, 210, 40, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Roommate Harmony Allotment Chart", 15, 25);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(220, 220, 220);
    doc.text(`Generated on: ${new Date().toLocaleString()} (Run #${runId})`, 15, 33);

    // Info Section
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Location: ${location.toUpperCase()}`, 15, 52);
    doc.text(`Category: ${category}`, 80, 52);
    doc.text(`Room Type: ${roomType}`, 145, 52);

    // Line Separator
    doc.line(15, 57, 195, 57);

    // Gather table rows
    const tableRows = [];
    groups.forEach((group, index) => {
      tableRows.push([
        `Room ${group.roomId}`,
        group.student_1 || "-",
        group.student_2 || "-",
        group.student_3 || "-",
        group.student_4 || "-"
      ]);
    });

    // Generate Table using jsPDF AutoTable plugin
    doc.autoTable({
      startY: 63,
      head: [["Room ID", "Student 1", "Student 2", "Student 3", "Student 4"]],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    });

    doc.save(`allotment_run_${runId}_${category}_${roomType}.pdf`);
  } catch (error) {
    console.error("Error generating run PDF:", error);
    alert("Failed to download PDF for this allotment run. Please try again.");
  }
}

function toggleMobileSidebar() {
  const sidebar = document.querySelector(".app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("mobile-open");
    if (sidebar.classList.contains("mobile-open")) {
      overlay.style.display = "block";
    } else {
      overlay.style.display = "none";
    }
  }
}
