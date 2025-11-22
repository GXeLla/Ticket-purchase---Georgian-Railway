const url = "https://railway.stepprojects.ge/api";
let displayedCount = 3; // თავიდან რამდენი გამოცნდეს ქარდი
const increment = 2; // ღილაკზე დაჭერისას რამდენი ჩატვირთოს (იხილე მეტი)
let cities = []; // სადგურების ჩამონათვალი, რომელიც გამოვა API-დან
let trainsData = []; // მატარებლების მონაცემები, რომელსაც ვაჩვენებთ

// Fetch stations & trains
// ===========================
async function fetchStationsAndTrains() {
  const startTime = Date.now(); // დროის აღება ლოადინგისთვის

  try {
    // ფეთჩი დროპდაუნისთვის
    const stationsRes = await fetch(`${url}/stations`);
    if (!stationsRes.ok) throw new Error("Failed to fetch stations");
    const stationsJson = await stationsRes.json();
    cities = stationsJson.map((s) => s.name);

    // რეისების ფეთჩი
    const trainsRes = await fetch(`${url}/trains`);
    if (!trainsRes.ok) throw new Error("Failed to fetch trains");
    trainsData = await trainsRes.json();

    // მინიმუმ 1 წამიანი ლოადინგ ანიმაცია
    const elapsed = Date.now() - startTime;
    const waitTime = Math.max(0, 1000 - elapsed);
    await new Promise((r) => setTimeout(r, waitTime));

    // ლოადინგის დამალვა
    document.getElementById("loading").style.display = "none";

    // მაინის გამოჩენა
    const mainDiv = document.getElementById("train-search");
    mainDiv.style.display = "flex";

    // =====
    displayResults(trainsData);
  } catch (err) {
    console.error("Error fetching data:", err);
    // ლოადინგს მალავს და ერორს აჩენს
    document.getElementById("loading").style.display = "none";
    const mainDiv = document.getElementById("train-search");
    mainDiv.style.display = "flex";
    mainDiv.innerHTML = "<p>Error loading data.</p>";
  }
}

// ურლ პარამეტრების წამოღება
// ===========================
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    date: params.get("date"), // თარიღი
    departure: params.get("departure"), // საიდან
    arrival: params.get("arrival"), // სად
    ticketCount: params.get("ticketCount"), // ბილეთების რაოდენობა
  };
}

// ფილტრის ფორმა და მატარებლები
// ===========================
function displayResults(trains) {
  const { date, departure, arrival, ticketCount } = getParams();
  const filterDiv = document.getElementById("search-filter");
  const todays = new Date().toISOString().split("T")[0];

  // ფილტრი
  // ---------------------------
  filterDiv.innerHTML = `
  <form id="filter-form">
    <div class="filter-card">
      <label for="date">თარიღი</label>
      <input type="date" id="date" name="date" value="${
        date || ""
      }" min="${todays}">
    </div>

    <div class="filter-card">
      <label for="departure">საიდან</label>
      <select id="departure" name="departure">
        <option value="" disabled ${
          !departure ? "selected" : ""
        }>აირჩიეთ სადგური</option>
        ${cities
          .map(
            (c) =>
              `<option value="${c}" ${
                departure === c ? "selected" : ""
              }>${c}</option>`
          )
          .join("")}
      </select>
    </div>

    <div class="filter-card">
      <label for="arrival">სად</label>
      <select id="arrival" name="arrival">
        <option value="" disabled ${
          !arrival ? "selected" : ""
        }>აირჩიეთ სადგური</option>
        ${cities
          .map(
            (c) =>
              `<option value="${c}" ${
                arrival === c ? "selected" : ""
              }>${c}</option>`
          )
          .join("")}
      </select>
    </div>

    <div class="filter-card">
      <label for="ticketCount">ბილეთების რაოდენობა</label>
      <input type="number" id="ticketCount" name="ticketCount" min="1" value="${
        ticketCount || 1
      }">
    </div>

    <button type="submit">ძებნა</button>
  </form>
`;

  // საიდან - სად / ერთიდაიგივე მიმართულების ამოშლა
  // ---------------------------
  const departureSelect = document.getElementById("departure");
  const arrivalSelect = document.getElementById("arrival");

  function updateArrivalOptions() {
    const selectedDeparture = departureSelect.value;
    // წაშლა და თავიდან გამოჩენა სად-ში
    arrivalSelect.innerHTML =
      `<option value="" disabled selected>აირჩიეთ სადგური</option>` +
      cities
        .filter((c) => c !== selectedDeparture)
        .map(
          (c) =>
            `<option value="${c}" ${
              arrival === c ? "selected" : ""
            }>${c}</option>`
        )
        .join("");
  }

  departureSelect.addEventListener("change", updateArrivalOptions);
  updateArrivalOptions();

  // ფორმა
  // ---------------------------
  document.getElementById("filter-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const newDate = document.getElementById("date").value;
    const newDeparture = departureSelect.value;
    const newArrival = arrivalSelect.value;
    const newTicketCount = document.getElementById("ticketCount").value;

    // ლინკის განახლება პარამეტრების შეცვლისას
    const newParams = new URLSearchParams({
      date: newDate,
      departure: newDeparture,
      arrival: newArrival,
      ticketCount: newTicketCount,
    });
    window.location.search = newParams.toString();
  });

  // ---------------------------
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`;
  const weekDayName = getDayName(today);

  // გაფილტრვა მატარებლების საიდა/სად.
  const filteredTrains = trains.filter((t) => {
    const matchesDeparture =
      !departure || (t.from && t.from.trim() === departure.trim());
    const matchesArrival = !arrival || (t.to && t.to.trim() === arrival.trim());
    return matchesDeparture && matchesArrival;
  });

  // დასორტირება დროის მიხედვით
  filteredTrains.sort((a, b) => a.departure.localeCompare(b.departure));

  const displayedTrainKeys = new Set();
  const trainsToShow = filteredTrains
    .filter((t) => {
      const key = `${t.number}-${t.from}-${t.to}-${
        t.departure || "not selected"
      }`;
      if (!displayedTrainKeys.has(key)) {
        displayedTrainKeys.add(key);
        return true;
      }
      return false;
    })
    .slice(0, displayedCount);

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (trainsToShow.length > 0) {
    trainsToShow.forEach((train) => {
      const trainElement = document.createElement("div");
      trainElement.classList.add("train-card");

      //ცალცალკე სპან ებში სტილისთვის
      const numberSpan = document.createElement("span");
      numberSpan.classList.add("train-number");
      numberSpan.textContent = `Train #${train.number}`;

      const trainName = document.createElement("span");
      trainName.classList.add("train-name");
      trainName.textContent = train.name;

      const fromSpan = document.createElement("span");
      fromSpan.classList.add("train-from");
      fromSpan.textContent = train.from;

      const toSpan = document.createElement("span");
      toSpan.classList.add("train-to");
      toSpan.textContent = train.to;

      const dateSpan = document.createElement("span");
      dateSpan.classList.add("train-date");
      dateSpan.textContent = formattedDate;

      const weekDaySpan = document.createElement("span");
      weekDaySpan.classList.add("train-weekday");
      weekDaySpan.textContent = `(${weekDayName})`;

      const departureSpan = document.createElement("span");
      departureSpan.classList.add("train-departure");
      departureSpan.textContent = train.departure || "not selected";

      const arriveSpan = document.createElement("span");
      arriveSpan.classList.add("train-arrive");
      arriveSpan.textContent = train.arrive;

      const buyBTN = document.createElement("button");
      buyBTN.textContent = "ბილეთის შეძენა";
      buyBTN.classList.add("btn", "buyBTN");

      // info.html ში პარამეტრების გადატანა ლინკით
      buyBTN.addEventListener("click", () => {
        const params = new URLSearchParams({
          number: train.number,
          name: train.name,
          from: train.from,
          to: train.to,
          date: formattedDate,
          weekday: weekDayName,
          departure: train.departure,
          arrive: train.arrive,
           ticketCount: ticketCount || 1 ,
           trainID: train.id
        });

        window.location.href = "info.html?" + params.toString();
      });

      trainElement.append(
        numberSpan,
        trainName,
        fromSpan,
        toSpan,
        dateSpan,
        weekDaySpan,
        departureSpan,
        arriveSpan,
        buyBTN
      );
      resultsDiv.appendChild(trainElement);
    });

    // "Show More" ღილაკი
    // ---------------------------
    const oldButton = document.getElementById("loadMoreBtn");
    if (oldButton) oldButton.remove();

    const loadMoreButton = document.createElement("button");
    loadMoreButton.id = "loadMoreBtn";
    loadMoreButton.classList.add("btn");
    loadMoreButton.textContent = "Show More";

    loadMoreButton.onclick = () => {
      if (displayedCount < filteredTrains.length) {
        displayedCount += increment;
        displayResults(trainsData); // მეტის ჩვენება
      } else {
        loadMoreButton.style.cursor = "auto";
        loadMoreButton.style.border = "2px solid red";
        loadMoreButton.style.color = "red";
        loadMoreButton.disabled = true;
      }
    };

    resultsDiv.appendChild(loadMoreButton);
  } else {
    resultsDiv.innerHTML =
      "<p>ამ პარამეტრებით არცერთი მატარებელი არ მიემგზავრება.</p>";
  }
}

//კვირის დღეები ქართულად
// ---------------------------
function getDayName(date) {
  const daysInGeorgian = [
    "კვირა",
    "ორშაბათი",
    "სამშაბათი",
    "ოთხშაბათი",
    "ხუთშაბათი",
    "პარასკევი",
    "შაბათი",
  ];
  return daysInGeorgian[date.getDay()];
}

// ჰტმლ ის გახსნისას გაიშვას
window.addEventListener("DOMContentLoaded", fetchStationsAndTrains);
