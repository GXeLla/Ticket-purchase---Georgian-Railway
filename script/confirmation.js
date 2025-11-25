function renderTicket(ticket) {
  const container = document.getElementById("ticket-info");

  // Ticket ინფორმაცია
  let html = `
  <div class="flex size">
  <div>ბილეთის ID: ${ticket.id}</div>
  <div>თარიღი: ${ticket.date}</div>
  </div>
    <h3>საკონტაქტო ინფორმაცია</h3>
    <div class="flex">
    <div>ელ.ფოსტა: ${ticket.email}</div>
    <div>ტელეფონი: ${ticket.phone}</div>
    </div>
    <hr>
  `;

  // Train ინფორმაცია
  if (ticket.train) {
    html += `
      <h3> ინფორმაცია</h3>
      <div class="flex">
      <div>მიმართულება: ${ticket.train.name}</div>
      <div>მატარებლის ნომერი: ${ticket.train.number}</div>
      </div>
      <div class="flex">
      <div>საიდან: ${ticket.train.from} - ${ticket.train.departure}</div>
      <div>სად: ${ticket.train.to || "–"} - ${ticket.train.arrive}</div>
      </div>
      <hr>
    `;
  }

  // Passengers table
  if (ticket.persons && ticket.persons.length > 0) {
    html += `<h3>მგზავრები</h3>`;
    html += `
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border:1px solid #000; padding:5px;">სახელი</th>
            <th style="border:1px solid #000; padding:5px;">ID</th>
            <th style="border:1px solid #000; padding:5px;">საგანგებო ინფორმაცია</th>
            <th style="border:1px solid #000; padding:5px;">ადგილი</th>
            <th style="border:1px solid #000; padding:5px;">ვაგონი</th>
            <th style="border:1px solid #000; padding:5px;">ფასი</th>
            <th style="border:1px solid #000; padding:5px;">გადახდილია</th>
          </tr>
        </thead>
        <tbody>
    `;

    ticket.persons.forEach((person) => {
      const seat = person.seat || {};
      html += `
        <tr>
          <td style="border:1px solid #000; padding:5px;">${person.name || "–"} ${person.surname || "–"}</td>
          <td style="border:1px solid #000; padding:5px;">${person.idNumber || "–"}</td>
          <td style="border:1px solid #000; padding:5px;">${person.note || "–"}</td>
          <td style="border:1px solid #000; padding:5px;">${seat.number || "–"}</td>
          <td style="border:1px solid #000; padding:5px;">${seat.vagonId || "–"}</td>
          <td style="border:1px solid #000; padding:5px;">${seat.price ? seat.price + " ₾" : "–"}</td>
          <td style="border:1px solid #000; padding:5px;">${seat.isOccupied ? "დიახ" : "არა"}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
  }

  // Ticket total price
  html += `<hr><div><strong>სრული ფასი:</strong> ${ticket.ticketPrice} ₾</div>`;

  container.innerHTML = html;
}

// Async function to fetch ticket info from API
async function fetchTicket() {
  const params = new URLSearchParams(window.location.search);

  // NEW: support direct ticketId parameter
  const directTicketId = params.get("ticketId");
  if (directTicketId) {
    console.log("Ticket ID from URL:", directTicketId);

    try {
      const apiUrl = `https://railway.stepprojects.ge/api/tickets/checkstatus/${directTicketId}`;
      const res = await fetch(apiUrl);

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      console.log("Ticket Status from API:", data);

      renderTicket(data);
      return; // STOP — do not continue to "response" logic
    } catch (err) {
      console.error("Failed to fetch direct ticketId:", err);
      return;
    }
  }

  // OLD LOGIC (keep existing)
  const responseStr = params.get("response");

  if (!responseStr) {
    console.log("No backend response found in URL.");
    return;
  }

  try {
    const decoded = decodeURIComponent(responseStr);
    console.log("Backend Response:", decoded);

    const parts = decoded.split(":");
    const ticketId = parts[parts.length - 1].trim();
    console.log("Extracted Ticket ID:", ticketId);

    const apiUrl = `https://railway.stepprojects.ge/api/tickets/checkstatus/${ticketId}`;
    const res = await fetch(apiUrl);

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    console.log("Ticket Status from API:", data);

    renderTicket(data);
  } catch (err) {
    console.error("Failed to fetch or parse ticket info:", err);
  }
}


// Initialize ticket fetch
fetchTicket();

// Print button
document.getElementById("print-btn").addEventListener("click", () => {
  window.print();
});

// Download as PDF using html2pdf
document.getElementById("download-btn").addEventListener("click", () => {
  const element = document.getElementById("ticket-container");
  const opt = {
    margin: 0.5,
    filename: `ticket.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };
  html2pdf().set(opt).from(element).save();
});

// აის დაგენერერებულია არ განმკიცხოთ დრო არ მეყო....