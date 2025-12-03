const url = "https://railway.stepprojects.ge/api";

async function fetchStations() {
  try {
    const response = await fetch(`${url}/stations`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    updateDropdowns(data);
  } catch (error) {
    console.error("Error fetching stations:", error);
  }
}

const translations = {
  eng: {
    searchTrains: "Search Trains",
    arrivalPlaceholder: "Select Arrival City",
    departurePlaceholder: "Select Departure City",
    register: "Register Here",
  },
  ka: {
    searchTrains: "რეისების ძიება",
    arrivalPlaceholder: "საიდან მიემგზავრებით",
    departurePlaceholder: "სად მიემგზავრებით",
    register: "რეგისტრაცია",
  },
};
// დროპდაუნები
function updateDropdowns(stations) {
  const departureDropdown = document.getElementById("departure-dropdown");
  const arrivalDropdown = document.getElementById("arrival-dropdown");

  departureDropdown.innerHTML = ""; // შიდა მონაცემების წაშლა
  arrivalDropdown.innerHTML = "";

  const currentDeparture = document.getElementById("departure-selector").value;

  // მაპით დროპდაუნში დივები
  departureDropdown.innerHTML = stations
    .map(
      (station) => `
        <div onclick="setCity('departure-selector', '${station.name}')">${station.name}</div>
    `
    )
    .join("");

  // ფილტრით ჩასვლის ადგილას ვაშორებთ საიდანაცმივდივართ, + დივები შექმნა
  const filteredStations = stations.filter((station) => station.name !== currentDeparture);
  arrivalDropdown.innerHTML = filteredStations
    .map(
      (station) => `
        <div onclick="setCity('arrival-selector', '${station.name}')">${station.name}</div>
    `
    )
    .join("");
}

// დროპდაუნის გაქრობა / გამოჩენა
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  if (dropdown.style.display === "block") fetchStations();
}

// დროპდაუნის გარეთ დაჭერისას ქრება
document.addEventListener("click", function (event) {
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) {
      dropdown.style.display = "none";
    }
  });
});

// ფუნქცია სადაც დროპდაუნში როცა იწერება ქრება დროპდაუნი
function setCity(inputId, city) {
  document.getElementById(inputId).value = city;
  closeAllDropdowns();
}

// ყველა დროპდაუნის გაქრობა
function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach((dropdown) => (dropdown.style.display = "none"));
}

// ჩანგე ლანგუაგე , ვხუმრობ ენის შეცვლა
function setLanguage(language) {
  const SearchTrainsText = document.getElementById("search-trains-text");
  const arrivalInput = document.getElementById("arrival-selector");
  const departureInput = document.getElementById("departure-selector");
  const register = document.getElementById("registration-link");

  if (language === "Eng") {
    SearchTrainsText.textContent = translations.eng.searchTrains;
    arrivalInput.placeholder = translations.eng.arrivalPlaceholder;
    departureInput.placeholder = translations.eng.departurePlaceholder;
    register.textContent = translations.eng.register;
  } else if (language === "Ka") {
    SearchTrainsText.textContent = translations.ka.searchTrains;
    arrivalInput.placeholder = translations.ka.arrivalPlaceholder;
    departureInput.placeholder = translations.ka.departurePlaceholder;
    register.textContent = translations.ka.register;
  }

  closeAllDropdowns();
}

const openPicker = document.getElementById("openPicker");
const dateInput = document.getElementById("date");

// უკანა დღეებს არ უთითებს
const today = new Date();
const formattedDate = today.toISOString().split("T")[0];
dateInput.setAttribute("min", formattedDate);

openPicker.addEventListener("click", () => {
  dateInput.showPicker();
});

dateInput.addEventListener("change", function () {
  const selectedDate = this.value;
  const image = document.getElementById("dateImage");

  // სურათს აქრობს თუ ტექსტი წერია
  image.style.display = selectedDate ? "none" : "block";

  // დღეს და თვეს დივში წერს
  const dateObject = new Date(selectedDate);
  document.querySelector(".month").textContent = dateObject.toLocaleString("default", { month: "short" });
  document.querySelector(".day").textContent = dateObject.getDate();
});

// ბილეთების რაოდენობა
let ticketCount = 1;
//განახლება
function displayCount() {
  document.getElementById("tkt-count").innerText = ticketCount;
}
// გაზრდა
function increment() {
  ticketCount++;
  displayCount();
}
//დაკლება
function decrement() {
  if (ticketCount > 1) {
    ticketCount--;
    displayCount();
  }
}

window.onload = displayCount;

// ფორმის სუბმითზე ფუნქცია
function submitForm() {
  const date = document.getElementById("date").value; // დღე
  const departure = document.getElementById("departure-selector").value; //საიდან
  const arrival = document.getElementById("arrival-selector").value; //სად

  // ახალ ლინკს ვქმნითპარამეტრებით
  const newPageUrl = `../pages/result.html?date=${encodeURIComponent(date)}&departure=${encodeURIComponent(
    departure
  )}&arrival=${encodeURIComponent(arrival)}&ticketCount=${encodeURIComponent(ticketCount)}`; // ბილეთების რაოდენობა

  // ახალ ტაბში გახსნას
  window.open(newPageUrl, "_blank");
}

// ფუნქცია ამუშავდეს მხოლოდ საბმით ტაიპ ბატონზე
document.querySelector("button[type='submit']").addEventListener("click", submitForm);

const welcomeText = document.getElementById("welcome");
const cursor = document.getElementById("cursor");
const text = "Welcome...";
let index = 0;
const typingSpeed = 450; //

function type() {
  if (index < text.length) {
    welcomeText.textContent += text.charAt(index);
    index++;
    setTimeout(type, typingSpeed);
  } else {
    setTimeout(() => {
      cursor.style.display = "none"; //  6 s
    }, 6000);
    setTimeout(() => {
      welcomeText.style.display = "none"; // 10 s
    }, 10000);
  }
}

type();
// იუზერის მონაცემების წამოღება userId-ის მიხედვით

async function fetchUserById() {
  const userId = localStorage.getItem("userId");
  const userProfile = document.getElementById("user-profile");
  const loginRegister = document.querySelector(".login-register");

  if (!userId) {
    // User არაა შესული
    if (userProfile) userProfile.style.display = "none";
    if (loginRegister) loginRegister.style.display = "block";
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`https://api.everrest.educata.dev/auth/id/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    if (!response.ok) throw new Error(`User fetch failed: ${response.status}`);

    const user = await response.json();
    console.log("Fetched user:", user);

    // იუზერის პროფილის ჩვენება და ლოგინის დამალვა
    if (userProfile) userProfile.style.display = "flex";
    if (loginRegister) loginRegister.style.display = "none";

    document.getElementById("user-avatar").src = user.avatar || "";
    document.getElementById("user-name").textContent = `${user.firstName} ${user.lastName}`;

    // მოდალის შევსება იუზერის მონაცემებით
    fillUserForm(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
  }
}

// იუზერის ინფორმაციის შევსება ფორმაში
function fillUserForm(user) {
  document.getElementById("firstName").value = user.firstName || "";
  document.getElementById("lastName").value = user.lastName || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("avatar-preview").src = user.avatar || "";
}

// მოდალის გახსნა
document.getElementById("edit-profile-icon").addEventListener("click", () => {
  document.getElementById("user-modal").style.display = "block";
});

// მოდალის დახურვა
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("user-modal").style.display = "none";
});

// ავატარის წინასწარი ჩვენება
document.getElementById("avatar").addEventListener("input", function () {
  const url = this.value.trim();
  if (url) {
    document.getElementById("avatar-preview").src = url;
  }
});

// იუზერის ინფორმაციის შენახვა
document.getElementById("save-user-btn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  const patchBody = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    avatar: document.getElementById("avatar-preview").src || "",
  };

  try {
    const response = await fetch(`https://api.everrest.educata.dev/auth/update`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(patchBody),
    });

    if (!response.ok) throw new Error(`განახლება ვერ მოხერხდა: ${response.status}`);

    const updatedUser = await response.json();
    console.log("განახლებული user ინფორმაცია:", updatedUser);

    document.getElementById("user-avatar").src = updatedUser.avatar;
    document.getElementById("user-name").textContent = `${updatedUser.firstName} ${updatedUser.lastName}`;

    // მოდალის დახურვა
    document.getElementById("user-modal").style.display = "none";
  } catch (error) {
    console.error("ხარვეზი უსერის განახლებაში", error);
  }
});

fetchUserById();
// სიგნ აუთ ფუნქცია
async function signOut() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("https://api.everrest.educata.dev/auth/sign_out", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error(`Sign out failed: ${response.status}`);

    // წაშლა localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    const userProfile = document.getElementById("user-profile");
    const loginRegister = document.querySelector(".login-register");

    if (userProfile) userProfile.style.display = "none";
    if (loginRegister) loginRegister.style.display = "block";

    console.log("იუსერი გამოვიდა სისტემიდან.");
  } catch (error) {
    console.error("ხარვეზი გამოსვლისას:", error);
  }
}

document.getElementById("sign-out-btn").addEventListener("click", signOut);

////  //  // ქალაქების გაცვლა
function swapCities() {
  const departureInput = document.getElementById("departure-selector");
  const arrivalInput = document.getElementById("arrival-selector");

  
  const temp = departureInput.value;
  departureInput.value = arrivalInput.value;
  arrivalInput.value = temp;

  closeAllDropdowns();
}


//parolis Secvla

async function changePassword(oldPassword, newPassword) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Token ვერ მოიძებნა. უნდაიყოთ შესული სისტემაში.");
    alert("გთხოვთ, ჯერ შეხვიდეთ სისტემაში.");
    return;
  }

  try {
    const response = await fetch("https://api.everrest.educata.dev/auth/change_password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
    });

    console.log("პაროლის შეცვლა:", response);
    const result = await response.json();
    console.log("პაროლის შეცვლის რეზულტატი:", result);

    if (response.ok) {
      alert("პაროლი წარმატებით შეიცვალა!");
    } else {
      alert(result.message || "პაროლის შეცვლა ვერ მოხერხდა");
    }
  } catch (error) {
    console.error("პაროლის შეცვლის ხარვეზი:", error);
  }
}

const changePassForm = document.getElementById("changePassForm");

if (changePassForm) {
  changePassForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    await changePassword(data.oldPassword, data.newPassword);
  });
} else {
  console.warn("changePassForm ვერ მოიძებნა / არ არსებობს HTML-ში");
}

// SHOW/HIDE პაროლის შეცვლის ფორმა
const showChangePassBtn = document.getElementById("showChangePassBtn");

if (showChangePassBtn && changePassForm) {
  showChangePassBtn.addEventListener("click", () => {
    if (changePassForm.style.display === "none") {
      changePassForm.style.display = "block";
      showChangePassBtn.textContent = "დამალე პაროლის შეცვლა";
    } else {
      changePassForm.style.display = "none";
      showChangePassBtn.textContent = "პაროლის შეცვლა";
    }
  });
}

//ექაუნთის წაშლა

const deleteBtn = document.getElementById("deleteBtn");
const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

// მოდალის გამოჩენა ღილაკზე "Delete My Account"
deleteBtn.addEventListener("click", () => {
  deleteModal.style.display = "flex";
});

// გაუქმება და მოდალის დამალვა
cancelDelete.addEventListener("click", () => {
  deleteModal.style.display = "none";
});

// დათანხმება და ექაუნთის წაშლა
confirmDelete.addEventListener("click", async () => {
  deleteModal.style.display = "none"; 
  await deleteAccount(); // ფუნქციის გამოძახება ექაუნთის წაშლისთვის
});

async function deleteAccount() {
  // იუზერის ტოკენის მიღება localStorage-დან
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("ვერ მოიძებნა ტოკენი. User არ არის შესული.");
    return;
  }

  try {
    const response = await fetch("https://api.everrest.educata.dev/auth/delete", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Delete response:", data);

    if (response.ok) {
      // ტოკენის და აიდის მოშეშლა localStorage-დან
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      console.log("ექაუნთი წაიშალა.");
    }
  } catch (error) {
    console.log("ხარვეზი წაშლისას:", error);
  }
}

function showTemporaryModal(message) {
//მოდალის შექმნა
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "9999";

  // შიგთავსი
  const box = document.createElement("div");
  box.style.background = "#fff";
  box.style.padding = "20px 30px";
  box.style.borderRadius = "8px";
  box.style.textAlign = "center";
  box.style.fontSize = "16px";
  box.style.fontWeight = "500";
  box.innerText = message;

  modal.appendChild(box);
  document.body.appendChild(modal);

  // 3 წამში მოდალის წაშლა
  setTimeout(() => {
    document.body.removeChild(modal);
  }, 3000);
}
