document
  .querySelector(".js-submitIt")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const tym = new Date().toISOString();
    const name = document.querySelector(".js-name").value;
    const clg = "ssn";
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
    const studyHabbits = document.querySelector(".js-study").value;
    const clean = document.querySelector(".js-clean").value;
    //const guest = document.querySelector(".js-guest").value;
    const light = document.querySelector(".js-light").value;
    const noise = document.querySelector(".js-noise").value;
    // const hobby = document.querySelector(".js-hobby").value;
    const location = document.querySelector(".js-location").value;

    const payload = {
      name: name,
      clg: clg,
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
              <input id="category-name" type="text" class="form-input" placeholder="e.g., 2nd Year SSN Students" />
            </div>
            <button type="submit" class="btn primary">Add Category</button>
          </form>
        `;
  document.body.appendChild(modalTemplate);
  attachModalClose();
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
  document.getElementById("categorydiv").innerHTML = `
  <option value="ssnit1st">1st year ssn it</option>
  <option value="ssncse2nd">2nd year ssn cse</option>
`;
}

function attachModalClose() {
  const closeBtn = document.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => {
    const modal = closeBtn.closest(".modal");
    modal.remove();
  });
}
