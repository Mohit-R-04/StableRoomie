console.log("hello");
document.querySelector(".js-submitIt")
    .addEventListener("click", async(event)=>{
        event.preventDefault();
        const name = document.querySelector(".js-name").value;
        const sleep = document.querySelector(".js-sleep").value;
        const wake = document.querySelector(".js-wake").value;
        const department = document.querySelector(".js-department").value;
        const year = Number(document.querySelector(".js-year").value);
        const phone = Number(document.querySelector(".js-phone").value);
        const studentId = Number(document.querySelector(".js-studentId").value);
        const studyTime = document.querySelector(".js-study").value;
        const room = document.querySelector(".js-room").value;
        const address = document.querySelector(".js-home").value;
        const emergencyContact = Number(document.querySelector(".js-emergency").value);
        const roomMates = document.querySelector(".js-friends").value;
        const studyHabbits = document.querySelector(".js-study").value;
        const clean = document.querySelector(".js-clean").value;
        //const guest = document.querySelector(".js-guest").value;
        const light = document.querySelector(".js-light").value;
        const noise = document.querySelector(".js-noise").value;
       // const hobby = document.querySelector(".js-hobby").value;
        console.log("Form Values:", {
          name: name,
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
         // guestPolicy: guest,
          lightSensitivity: light,
          noiseLevel: noise,
         // hobbies: hobby
        });
        const payload = {
          name: name,
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
          
        };

        try {
          const response = await fetch("http://localhost:8080/getStudentDetails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
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

        


        fetch("http://127.0.0.1:5000/allot_roommates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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