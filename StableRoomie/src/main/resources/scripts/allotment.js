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
    const year = Number(document.querySelector(".js-year").value);
    const phone = document.querySelector(".js-phone").value;
    const studentId = Number(document.querySelector(".js-studentId").value);
    const studyTime = document.querySelector(".js-study").value;
    const room = document.querySelector(".js-room").value;
    const address = document.querySelector(".js-home").value;
    const emergencyContact = document.querySelector(".js-emergency").value;
    const roomMates = document.querySelector(".js-friends").value;
    const studyHabbits = document.querySelector(".js-studyHabits").value; // Fix typo: use .js-studyHabits
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
      const response = await fetch("http://localhost:8080/saveStudents", {
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
  const location = document.getElementById("location").value;
  if (!(location && category && roomType && numStudents)) {
    alert("Please fill all details");
    return false;
  }

  fetch("http://127.0.0.1:5000/allot_roommates", {
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

function handleLogin() {
  // Prompt for email and handle null case
  const email = prompt("Enter email (use @ssn.admin.edu.in for admin):");

  // Check if user clicked Cancel
  if (!email) {
    return; // Exit function if user cancelled
  }

  const isAdmin = email.endsWith("@ssn.admin.edu.in");

  // Remove active class from all pages
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));

  // Show appropriate dashboard
  if (isAdmin) {
    document.getElementById("admin-dashboard-page").classList.add("active");
  } else {
    document.getElementById("dashboard-page").classList.add("active");
  }
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
    const response = await fetch("http://localhost:8080/get-category");
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
document.addEventListener("DOMContentLoaded", showCategory);

// Call this function after adding, editing, or removing a category
function refreshCategories() {
  showCategory();
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
  const request = await fetch("http://localhost:8080/save-category", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });
  console.log(request.json());
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
    const response = await fetch("http://localhost:8080/get-category");
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
function sendRoomAndHostel() {
  const addButton = document.querySelector(".js-add-button");
  addButton.addEventListener("click", async(event) => {
    event.preventDefault();
    const name = document.querySelector(".js-getHostel").value;
    const no = document.querySelector(".js-getRoomNo").value;
    obj = { name, no: Number(no) };
    
    const response = await fetch("http://localhost:8080/room-details", {
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify(obj)
    });
    const getResponse = await response.json();
    console.log(getResponse);
    getDepartmentAndRoomType();


  });
}
async function getDepartmentAndRoomType(){
  const response = await fetch("http://localhost:8080/get-category", {
    method : "GET",
    header : {
      "Content-Type" : "application/json"
    }
  })
  const roomResponse = await fetch("http://localhost:8080/get-rooms", {
    method : "GET",
    header : {
      "Content-Type" : "application/json"
    }
  })

  
  let departmentAndYear = await response.json();
  let departmentHTML = ``
  departmentAndYear.forEach((dandy)=>{
    console.log(dandy);
    let values = dandy.category.split("-");
    const clg = values[0];
    const department = values[1];
    const year = values[2];
    departmentHTML += `<option value="${department}" selected>
                        ${department}
                      </option>`;
    
    

  })
  const selectForm = document.querySelector(".js-department");
  selectForm.innerHTML = departmentHTML;

  let rooms = await roomResponse.json();
  roomHTML = ``
  rooms.forEach((room)=>{
    roomType = room.roomType;
    roomHTML += `<option value="${roomType}">${roomType}</option>`
  })
  const selectRoom = document.querySelector(".js-allot-room-type")
  selectRoom.innerHTML = roomHTML;
  const selectRoomInForm = document.querySelector(".js-room")
  selectRoomInForm.innerHTML = roomHTML;

}
getDepartmentAndRoomType();
sendRoomAndHostel();