// ------------------ ლოადინგ ანიმაციისთვის ------------------
const loading = document.getElementById("loading");
const header = document.querySelector("header");
const main = document.querySelector("main");

// გამოაჩინოს ანიმაცია და დამალოს ჰედერი და მაინ
function showLoading() {
  loading.style.display = "flex";
  header.style.display = "none";
  main.style.display = "none";
  console.log("ლოადერი გამოჩნდა & მაინი, ჰედერი დაიმალა.");
}

// ლოადერის დამალვა და გამოჩენა კონტენტის
function hideLoading() {
  loading.style.display = "none";
  header.style.display = "block";
  main.style.display = "block";

  header.style.transition = "opacity 4s ease-in-out";
  main.style.transition = "opacity 4s ease-in-out";

  header.style.opacity = 0;
  main.style.opacity = 0;

  requestAnimationFrame(() => {
    header.style.opacity = 1;
    main.style.opacity = 1;
  });

  console.log("ლოადერი დაიმალა, ჰედერი & მაინი გამოჩნდა!");
}

// ------------------ Train Data URL-დან ------------------
const params = new URLSearchParams(window.location.search);

const trainData = {
  number: params.get("number"),
  name: params.get("name"),
  from: params.get("from"),
  to: params.get("to"),
  date: params.get("date"),
  weekday: params.get("weekday"),
  departure: params.get("departure"),
  arrive: params.get("arrive"),
  ticketCount: parseInt(params.get("ticketCount")) || 1,
  trainID: params.get("trainID"),
};

console.log("Train data URL-დან:", trainData);

// ------------------ ინფორმაციის შევსება ჰტმლ-ში ------------------
document.getElementById("train-number").textContent = "მატარებელი #" + trainData.number;
document.getElementById("train-name").textContent = trainData.name;
document.getElementById("train-from").textContent = trainData.from;
document.getElementById("train-to").textContent = trainData.to;
document.getElementById("train-date").textContent = trainData.date;
document.getElementById("train-weekday").textContent = trainData.weekday;
document.getElementById("train-departure").textContent = trainData.departure;
document.getElementById("train-arrive").textContent = trainData.arrive;
document.getElementById("train-ticketCount").textContent = trainData.ticketCount;

// ------------------ ელემენტები ------------------
const ticketsContainer = document.getElementById("tickets-container");
const passengersSummary = document.getElementById("passengers-summary");
const summaryEmail = document.getElementById("summary-email");
const summaryTicketCount = document.getElementById("summary-ticket-count");
const summaryTotal = document.getElementById("summary-total");
const seatOptions = document.getElementById("seat-options");
const modal = document.getElementById("seat-modal");
const wagonContainer = document.getElementById("wagon-container");

let tickets = [];
let currentSeatSpan = null;
const selectedSeats = new Set();

// ------------------ ბილეთების ფორმა ------------------
for (let i = 0; i < trainData.ticketCount; i++) {
  const div = document.createElement("div");
  div.className = "ticket";
  div.innerHTML = `
    <h3>Ticket ${i + 1}</h3>
    <input type="text" placeholder="სახელი" class="ticket-name" required>
    <input type="text" placeholder="გვარი" class="ticket-surname" required>
    <input type="text" placeholder="პირადობის ნომერი ID" class="ticket-id" required>
    <button class="seat-select-btn btn">აირჩიეთ ადგილი</button>
    <span class="selected-seat"></span>
  `;
  ticketsContainer.appendChild(div);

  tickets.push({
    nameInput: div.querySelector(".ticket-name"),
    surnameInput: div.querySelector(".ticket-surname"),
    idInput: div.querySelector(".ticket-id"),
    seatSpan: div.querySelector(".selected-seat"),
  });
}

console.log("ბილეთები სულ:", tickets);

// ------------------ ადგილის მოდალი ------------------
document.querySelectorAll(".seat-select-btn").forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    currentSeatSpan = tickets[idx].seatSpan;
    modal.style.display = "flex";
    console.log(`ადიგილის მოდალი გაიხსნა ბილეთი N: ${idx + 1}`);
  });
});

// მოდალის გათიშვა გარეთ დაჭერისას
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    console.log("მოდალი დაიხურა!");
  }
});

// ------------------ ინვოისი ------------------
function updateSummary() {
  passengersSummary.innerHTML = "";
  let totalPrice = 0;

  tickets.forEach((t) => {
    const seatPrice = parseFloat(t.seatSpan.dataset.price) || 0;
    totalPrice += seatPrice;

    const li = document.createElement("li");
    li.textContent = `${t.nameInput.value || "-"} ${t.surnameInput.value || "-"} - ${t.seatSpan.textContent || "-"}`;
    passengersSummary.appendChild(li);
  });

  summaryTotal.textContent = totalPrice.toFixed(2);
  console.log("სულ:", totalPrice.toFixed(2)); // 12,50 მაგ...
}

document.getElementById("email").addEventListener("input", updateSummary);
tickets.forEach((t) => {
  t.nameInput.addEventListener("input", updateSummary);
  t.surnameInput.addEventListener("input", updateSummary);
});

// ------------------ ინვოისის ღილაკი ------------------
document.getElementById("checkout-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  if (!email) {
    alert("Email-ი არარი შეყვანილი!");
    console.log("მაილი არაა შეყვანილი!");
    return;
  }

  const ticketData = tickets.map((t) => ({
    name: t.nameInput.value,
    surname: t.surnameInput.value,
    personalId: t.idInput.value,
    seat: t.seatSpan.textContent,
    price: parseFloat(t.seatSpan.dataset.price) || 0,
  }));

  const totalPrice = ticketData.reduce((sum, t) => sum + t.price, 0);

  const bookingData = {
    contactEmail: email,
    contactPhone: document.getElementById("phone").value,
    tickets: ticketData,
    total: totalPrice,
  };

  console.log("საბოლოო ინფორმაცია:", bookingData);
});

updateSummary();

// ------------------ Fetch Wagons & Seats ------------------
async function loadApiData() {
  showLoading();

  const url = "https://railway.stepprojects.ge/api";

  try {
    const response = await fetch(`${url}/vagons`);
    if (!response.ok) throw new Error("API error: " + response.status);

    const data = await response.json();
    console.log("Full API Response:", data);

    const trainID = Number(trainData.trainID);
    const matchingVagons = data.filter((vagon) => vagon.trainId === trainID); // თუ ურლ დან იდემთხვევა მატარებლის იდს წამოიღოს ვაგონები
    console.log("ვაგონები:", matchingVagons);

    wagonContainer.innerHTML = "";
    seatOptions.innerHTML = "";

    matchingVagons.forEach((vagon) => {
      const vagonDiv = document.createElement("div");
      vagonDiv.classList.add("vagon-item");

      // Label
      const label = document.createElement("h4");
      label.textContent = vagon.name;
      label.classList.add("vagon-label");

      // Img
      const img = document.createElement("img");
      img.src = "../pictures/train-mid-wagon.png"; //===
      img.alt = vagon.name;
      img.classList.add("vagon-image");

      vagonDiv.appendChild(label);
      vagonDiv.appendChild(img);

      // ვაგონების სურათზე დაჭერისას გაიხსნას სკამები
      vagonDiv.addEventListener("click", () => {
        seatOptions.innerHTML = "<h3>აირჩიეთ ადგილი</h3>";

        vagon.seats.forEach((seat) => {
          const btn = document.createElement("button");
          btn.textContent = seat.number;
          btn.classList.add("seat-button");
          btn.id = `seat-${seat.seatId}`;

          if (seat.isOccupied) {
            btn.classList.add("reserved");
            btn.disabled = true;
          }

          btn.addEventListener("click", (e) => {
            e.stopPropagation();

            if (seat.isOccupied) {
              alert(`ადგილი ${seat.number} დაკავებულია!`);
              return;
            }

            if (selectedSeats.has(seat.seatId)) {
              alert(`ადგილი ${seat.number} სხვა ბილეთშია დაფიქსირებული!`);
              return;
            }

            if (currentSeatSpan) {
              currentSeatSpan.textContent = `ადგილი N: ${seat.number} - ${seat.price}₾`;
              currentSeatSpan.dataset.price = seat.price;
            }

            selectedSeats.add(seat.seatId);
            modal.style.display = "none";
            updateSummary();
          });

          seatOptions.appendChild(btn);
        });

        seatOptions.style.display = "grid";
      });

      wagonContainer.appendChild(vagonDiv);
    });
  } catch (error) {
    console.error("Fetch failed:", error);
  } finally {
    setTimeout(() => {
      hideLoading();
    }, 2000);
  }
}

loadApiData();
