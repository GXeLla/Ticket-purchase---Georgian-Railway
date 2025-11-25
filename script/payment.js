// ---------------------- ბილეთების დაფეთჩვა----------------------
async function fetchAllTickets() {
  try {
    const response = await fetch("https://railway.stepprojects.ge/api/tickets");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const tickets = await response.json();
    console.log("Total tickets from API:", tickets.length);
    console.log("Tickets data:", tickets);
  } catch (err) {
    console.error("Failed to fetch tickets:", err);
  }
}
fetchAllTickets();

// ---------------------- დატას წამოღება ლინკიდან ----------------------
const params = new URLSearchParams(window.location.search);
const bookingDataStr = params.get("bookingData");
if (!bookingDataStr) throw new Error("No booking data in URL");
const bookingData = JSON.parse(decodeURIComponent(bookingDataStr));
console.log("bookingData", bookingData);

// ---------------------- კვირის დღეები/თვე ქართულად ----------------------
const georgianMonths = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];
const georgianWeekdays = ["კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"];

// ---------------------- FORMAT DATE TO GEORGIAN ----------------------
function formatDateToGeorgian(dateStr) {
  let parts, day, month, year;

  if (dateStr.includes("-")) {
    parts = dateStr.split("-");
    if (parts[2].length === 4) {
      // 25/05/2025
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    } else {
      // 2025/05/25
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
  } else return dateStr;

  const date = new Date(year, month, day);
  const weekday = georgianWeekdays[date.getDay()];
  const monthName = georgianMonths[month];

  return `${weekday} ${day} ${monthName}`;
}

// ინფორმაციის გადაყვანა ქართული ენით დროში
bookingData.date = formatDateToGeorgian(bookingData.date);
console.log("Updated bookingData with Georgian date:", bookingData);

// ---------------------- შევსება ----------------------
document.getElementById("payment-email").textContent = bookingData.email || "-";
document.getElementById("payment-phone").textContent = bookingData.phone || "-";
document.getElementById("payment-total").textContent = bookingData.ticketPrice?.toFixed(2) || "0";

// ბილეთის შევსება
const ticketsList = document.getElementById("payment-tickets");
ticketsList.innerHTML = "";
bookingData.persons.forEach((p) => {
  const li = document.createElement("li");
  li.textContent = `${p.name || "-"} ${p.surname || "-"} - ${p.seat?.number || "-"} - ${
    p.seat?.price?.toFixed(2) || "0"
  }₾`;
  ticketsList.appendChild(li);
});

// ---------------------- ინფორმაციის გატანა ----------------------
function transformBookingData(bookingData) {
  return {
    trainId: Number(bookingData.trainID),
    date: new Date().toISOString(), 
    email: bookingData.email,
    phoneNumber: bookingData.phone,
    people: bookingData.persons.map((p) => ({
      seatId: p.seat.seatId,
      name: p.name,
      surname: p.surname,
      idNumber: p.idNumber,
      status: "booked", 
      payoutCompleted: p.payoutCompleted || false,
    })),
  };
}

// ---------------------- ყიდვის ღილაკი ----------------------
const payBtn = document.querySelector(".checkout-btn");
payBtn.addEventListener("click", async () => {
  try {
    const finalPayload = transformBookingData(bookingData);

    // ---------------------- დავლოგოთ სანამ გადააგზავნის  ----------------------
    console.log("ვაგზავნით სრული ინფო:", JSON.stringify(finalPayload, null, 2));

    // ---------------------- POST TO BACKEND ----------------------
    const response = await fetch("https://railway.stepprojects.ge/api/tickets/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
    });

    const rawResponse = await response.text();
    console.log("ბექიდან:", rawResponse);

    // ---------------------- REDIRECT TO CONFIRMATION PAGE ----------------------
    const encodedResponse = encodeURIComponent(rawResponse);
    window.location.href = `../pages/confirmation.html?response=${encodedResponse}`;
  } catch (error) {
    console.error("ვერ მოხერხდა გადაგზავნა bookingData:", error);
    alert("გადახდა ვერ განხორციელდა, სცადეთ თავიდან.");
  }
});
