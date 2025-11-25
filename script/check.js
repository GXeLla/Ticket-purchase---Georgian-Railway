const fetchBtn = document.getElementById("fetch-btn");
const ticketIdInput = document.getElementById("ticket-id");
const ticketContainer = document.getElementById("ticket-container");

// ფუნქცია დასახელებისთვის + მონაცემები
function createLine(label, value) {
  const div = document.createElement("div");
  div.style.marginBottom = "5px";

  const labelSpan = document.createElement("span");
  labelSpan.textContent = `${label}: `;
  labelSpan.style.fontWeight = "bold";

  const valueSpan = document.createElement("span");
  valueSpan.textContent = value || "–";

  div.appendChild(labelSpan);
  div.appendChild(valueSpan);
  return div;
}

// Dom
function createTicketCard(ticket) {
  const card = document.createElement("div");
  card.classList.add("ticket-card");
  card.style.border = "1px solid #ccc";
  card.style.borderRadius = "12px";
  card.style.padding = "15px";
  card.style.marginBottom = "20px";
  card.style.background = "#fff";
  card.style.boxShadow = "0 3px 10px rgba(0,0,0,0.1)";

  // Header
  const header = document.createElement("div");
  header.textContent = `ბილეთი #${ticket.id}`;
  header.style.fontWeight = "bold";
  header.style.fontSize = "18px";
  header.style.color = "#007bff";
  header.style.marginBottom = "10px";
  card.appendChild(header);

  // ბილეთის ინფორმაციის სექცია
  const ticketInfo = document.createElement("div");
  ticketInfo.style.marginBottom = "10px";
  ticketInfo.appendChild(createLine("თარიღი", ticket.date));
  ticketInfo.appendChild(createLine("ელ.ფოსტა", ticket.email));
  ticketInfo.appendChild(createLine("ტელეფონი", ticket.phone));
  card.appendChild(ticketInfo);

  // მატარებლის ინფორმაციის სექცია
  const trainInfo = document.createElement("div");
  trainInfo.style.marginBottom = "10px";
  trainInfo.appendChild(createLine("მიმართულება", ticket.train.name));
  trainInfo.appendChild(createLine("მატარებლის ნომერი", ticket.train.number));
  trainInfo.appendChild(createLine("საიდან", ticket.train.from));
  trainInfo.appendChild(createLine("სად", ticket.train.to));
  card.appendChild(trainInfo);

  // მგზავრების ინფორმაცია
  const passengersSection = document.createElement("div");
  passengersSection.style.marginTop = "10px";
  const passengersHeader = document.createElement("div");
  passengersHeader.textContent = "მგზავრები:";
  passengersHeader.style.fontWeight = "bold";
  passengersHeader.style.marginBottom = "5px";
  passengersSection.appendChild(passengersHeader);

  if (ticket.persons && ticket.persons.length > 0) {
    ticket.persons.forEach((person) => {
      const personDiv = document.createElement("div");
      personDiv.style.padding = "8px";
      personDiv.style.marginBottom = "5px";
      personDiv.style.border = "1px solid #eee";
      personDiv.style.borderRadius = "6px";
      personDiv.style.background = "#f9f9f9";

      personDiv.appendChild(createLine("სახელი", person.name));
      personDiv.appendChild(createLine("ID", person.idNumber));
      personDiv.appendChild(
        createLine("ადგილი", `${person.seat.number}, ვაგონი: ${person.seat.vagonId}, ფასი: ${person.seat.price} ₾`)
      );

      passengersSection.appendChild(personDiv);
    });
  } else {
    passengersSection.appendChild(createLine("", "ბილეთს მგზავრი არ ყავს"));
  }

  card.appendChild(passengersSection);

  // ღილაკები footers 
  const footer = document.createElement("div");
  footer.style.marginTop = "15px";
  footer.style.display = "flex";
  footer.style.gap = "10px";
//წაშლის
  const delBtn = document.createElement("button");
  delBtn.textContent = "ბილეთის წაშლა";
  delBtn.style.background = "#a72828ff";
  delBtn.style.color = "#fff";
  delBtn.style.border = "none";
  delBtn.style.padding = "5px 10px";
  delBtn.style.borderRadius = "5px";

delBtn.onclick = async () => {
  if (!confirm("ნამდვილად გსურთ ბილეთის გაუქმება?")) return;

  try {
    const res = await fetch(`https://railway.stepprojects.ge/api/tickets/cancel/${ticket.id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "წაშლა ვერ შესრულდა");
    }

    alert("ბილეთი გააუქმდა");
    card.remove();
  } catch (err) {
    alert("ვერ მოხერხდა წაშლა: " + err.message);
  }
};
// გადადის ქონფირმაიშენ ჰტმლ
  const pdfBtn = document.createElement("button");
  pdfBtn.textContent = "ნახე PDF";
  pdfBtn.style.background = "#17a2b8";
  pdfBtn.style.color = "#fff";
  pdfBtn.style.border = "none";
  pdfBtn.style.padding = "5px 10px";
  pdfBtn.style.borderRadius = "5px";

  // გადადის confirmation.html ბილეთის იდთ
  pdfBtn.onclick = () => {
    window.location.href = `confirmation.html?ticketId=${ticket.id}`;
  };

  footer.appendChild(delBtn);
  footer.appendChild(pdfBtn);
  card.appendChild(footer);

  return card;
}

// ბილეთის დაფეთჩვა API-დან
async function fetchTicket(ticketId) {
  try {
    const res = await fetch(`https://railway.stepprojects.ge/api/tickets/checkstatus/${ticketId}`);
       if (!res.ok) {
      // დომ შიგნით ანახებს ერრორს
      ticketContainer.innerHTML = `
        <div style="
          padding: 15px;
          background: #ffe5e5;
          border: 1px solid #ffaaaa;
          border-radius: 10px;
          color: #a30000;
          font-weight: bold;
          margin-top: 10px;
        ">
          ბილეთი ვერ მოიძებნა!
        </div>
      `;
      return; 
    }

    const ticket = await res.json();
    console.log(ticket); 

    ticketContainer.innerHTML = ""; // შლის წინა ქარდებს
    const card = createTicketCard(ticket);
    ticketContainer.appendChild(card);
  } catch (err) {
        // დომში ერორრ ჰანდლე
    ticketContainer.innerHTML = `
      <div style="
        padding: 15px;
        background: #ffe5e5;
        border: 1px solid #ffaaaa;
        border-radius: 10px;
        color: #a30000;
        font-weight: bold;
        margin-top: 10px;
      ">
        შეცდომა: ${err.message}
      </div>
    `;
  }
}

//
fetchBtn.addEventListener("click", () => {
  const ticketId = ticketIdInput.value.trim();
  if (!ticketId) return;
  fetchTicket(ticketId);
});
