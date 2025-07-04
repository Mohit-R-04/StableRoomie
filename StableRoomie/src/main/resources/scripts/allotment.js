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
  // Simulate admin detection based on email domain
  const isAdmin = prompt(
    "Enter email (use @ssn.admin.edu.in for admin):"
  ).endsWith("@ssn.admin.edu.in");
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
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
              <select id="category-department" class="form-input">
                <option value="">-- Select Department --</option>
                <option value="cse">CSE</option>
                <option value="ece">ECE</option>
                <option value="eee">EEE</option>
                <option value="mech">Mechanical</option>
                <option value="civil">Civil</option>
                <option value="it">IT</option>
                <option value="bme">BME</option>
              </select>
              <select id="category-year" class="form-input">
                <option value="">-- Select Year --</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
              </select>
            </div>
            <button onclick="addCategory()" class="btn primary">Add Category</button>
          </form>
        `;
  document.body.appendChild(modalTemplate);
  attachModalClose();
}

async function addCategory() {
  const clg = document.getElementById("category-college").value;
  const department = document.getElementById("category-department").value;
  const year = document.getElementById("category-year").value;
  if (!(category && clg && department && year)) {
    alert("Please fill all details");
    return false;
  }
  const category = clg + department + year;
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

function showCategoryForm() {
  const categorySelect = document.getElementById("category");
  // Clear existing options except the placeholder
  categorySelect.innerHTML = '<option value="">Select Category</option>';

  // Define colleges, departments, and years
  const colleges = [
    { prefix: "ssn", name: "SSN College" },
    { prefix: "snu", name: "Shiv Nadar University" },
  ];
  const departments = ["cse", "ece", "eee", "mech", "civil", "it", "bme"];
  const years = ["1st", "2nd", "3rd", "4th"];

  // Generate options for each combination
  colleges.forEach((college) => {
    departments.forEach((dept) => {
      years.forEach((year) => {
        const value = `${college.prefix}${dept}${year}`; // e.g., "ssncse2nd", "snuece1st"
        const text = `${college.name} ${dept.toUpperCase()} ${year} Year`;
        const option = document.createElement("option");
        option.value = value;
        option.text = text;
        categorySelect.appendChild(option);
      });
    });
  });
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
  addButton.addEventListener("click", () => {
    const name = document.querySelector("js-getHostel").value;
    const no = document.querySelector("js-getRoomNo").value;
    obj = { name, no };
    fetch("http://localhost:8080/");
  });
}
