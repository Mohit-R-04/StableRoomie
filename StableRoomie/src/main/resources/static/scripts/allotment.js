document
  .querySelector(".js-submitIt")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const tym = new Date().toISOString();
    const name = document.querySelector(".js-name").value;
    const clg = "ssn"; // yet to be implemented
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
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save preferences. Please try again.");
    }
  });

function allotRooms() {
  const category = document.getElementById("category").value;
  const roomType = document.getElementById("allot-room-type").value;
  const numStudents = document.getElementById("num-students").value;
  const location = document.getElementById("allot-location").value;
  if (!(location && category && roomType && numStudents)) {
    alert("Please fill all details");
    return false;
  }

  fetch("/allot_roommates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: location,
      category: category,
      roomType: roomType,
      numStudents: numStudents,
    }), // send empty or actual data if needed
  })
    .then((response) => response.json())
    .then((data) => window.alert(data.message))
    .catch((error) => {
      console.error("Error:", error);
    });
}

function showDashboard() {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById("dashboard-page").classList.add("active");
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

function showAdminDashboard() {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById("admin-dashboard-page").classList.add("active");
}

function showStudentDashboard() {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById("dashboard-page").classList.add("active");
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
            <span><strong>${room.roomType}</strong> (${room.noOfStudents} persons)</span>
            <div class="room-type-actions">
              <button class="btn secondary small remove" onclick="removeRoom(${room.roomId})">Remove</button>
            </div>
          `;
          roomList.appendChild(item);
        });
      }
    }

    // Populate room-type dropdowns (student form + allot form)
    let roomHTML = "";
    rooms.forEach((room) => {
      roomHTML += `<option value="${room.roomType}">${room.roomType} (${room.noOfStudents}-sharing)</option>`;
    });

    const studentRoomSelect = document.querySelector(".js-room");
    if (studentRoomSelect) studentRoomSelect.innerHTML = roomHTML || '<option value="">No room types available</option>';

    const allotRoomSelect = document.querySelector(".js-allot-room-type");
    if (allotRoomSelect) allotRoomSelect.innerHTML = roomHTML || '<option value="">No room types available</option>';

  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}

async function removeRoom(id) {
  try {
    const response = await fetch(`/remove-room/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Failed to delete room: ${response.status}`);
    showRooms();
  } catch (error) {
    console.error("Error removing room:", error);
    alert("Failed to remove room type. Please try again.");
  }
}

// Populate department dropdown from categories
async function getDepartmentFromCategories() {
  try {
    const response = await fetch("/get-category");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const categories = await response.json();
    let departmentHTML = "";
    categories.forEach((cat) => {
      const values = cat.category.split("-");
      const department = values[1] || cat.category;
      departmentHTML += `<option value="${department}">${department}</option>`;
    });
    const selectForm = document.querySelector(".js-department");
    if (selectForm) selectForm.innerHTML = departmentHTML || '<option value="">No categories added yet</option>';
  } catch (error) {
    console.error("Error loading departments:", error);
  }
}

function sendRoomAndHostel() {
  const addButton = document.querySelector(".js-add-button");
  if (!addButton) return;
  addButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const name = document.querySelector(".js-getHostel").value;
    const no = document.querySelector(".js-getRoomNo").value;
    if (!name || !no) {
      alert("Please fill hostel name and number of persons.");
      return;
    }
    const obj = { name, no: Number(no) };

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
      document.querySelector(".js-getRoomNo").value = "";
      // Refresh lists
      showRooms();
    } catch (error) {
      console.error("Error adding room:", error);
      alert("Failed to add room type.");
    }
  });
}

function handleLoginWithAccountChooser() {
  // Force Google to show account chooser
  const googleAuthUrl = "/oauth2/authorization/google?prompt=select_account";
  window.location.href = googleAuthUrl;
}
