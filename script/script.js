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
    register : "Register Here"
  },
  ka: {
    searchTrains: "რეისების ძიება",
    arrivalPlaceholder: "საიდან მიემგზავრებით",
    departurePlaceholder: "სად მიემგზავრებით",
    register : "რეგისტრაცია"
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
