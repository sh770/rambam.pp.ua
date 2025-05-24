let participants = JSON.parse(localStorage.getItem("participants")) || [];
let lotteryTitle = localStorage.getItem("lotteryTitle") || "";

function renderTable() {
  const table = document.getElementById("participantsTable");
  table.innerHTML = "";
  participants.forEach((p, i) => {
    table.innerHTML += `
      <tr>
        <td><input type="text" value="${p.name}" onchange="updateName(${i}, this.value)"></td>
        <td><input type="number" min="1" value="${p.tickets}" onchange="updateTickets(${i}, this.value)"></td>
        <td><button onclick="updateTickets(${i}, document.querySelectorAll('tbody input')[${i * 2 + 1}].value)">שנה</button></td>
        <td><button onclick="removeParticipant(${i})">X</button></td>
      </tr>
    `;
  });
}

function updateTickets(index, newTickets) {
  const tickets = parseInt(newTickets);
  if (!isNaN(tickets) && tickets > 0) {
    participants[index].tickets = tickets;
    localStorage.setItem("participants", JSON.stringify(participants));
    renderTable();
  }
}

function updateName(index, newName) {
  if (newName.trim()) {
    participants[index].name = newName.trim();
    localStorage.setItem("participants", JSON.stringify(participants));
  }
}

function renderTitle() {
  document.getElementById("lotteryTitleDisplay").innerText = lotteryTitle;
}

function setLotteryTitle() {
  const titleInput = document.getElementById("lotteryTitleInput").value.trim();
  if (!titleInput) return;
  lotteryTitle = titleInput;
  localStorage.setItem("lotteryTitle", lotteryTitle);
  renderTitle();
  document.getElementById("lotteryTitleInput").value = "";
}

function addParticipant() {
  const name = document.getElementById("nameInput").value.trim();
  const tickets = parseInt(document.getElementById("ticketsInput").value);
  if (!name || isNaN(tickets) || tickets <= 0) return;
  participants.push({ name, tickets });
  localStorage.setItem("participants", JSON.stringify(participants));
  renderTable();
  document.getElementById("nameInput").value = "";
  document.getElementById("ticketsInput").value = "";
}

function removeParticipant(index) {
  participants.splice(index, 1);
  localStorage.setItem("participants", JSON.stringify(participants));
  renderTable();
}

function resetParticipants() {
  if (confirm("האם אתה בטוח שברצונך לאפס את הרשימה ואת כותרת ההגרלה?")) {
    participants = [];
    lotteryTitle = "";
    localStorage.removeItem("participants");
    localStorage.removeItem("lotteryTitle");
    renderTable();
    renderTitle();
  }
}

function drawWinner() {
  let pool = [];
  participants.forEach(p => {
    for (let i = 0; i < p.tickets; i++) {
      pool.push(p.name);
    }
  });
  if (pool.length === 0) return;

  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const randomIndex = array[0] % pool.length;
  const winner = pool[randomIndex];

  document.getElementById("winnerPopup").innerText = `🎉 הזוכה הוא: ${winner} 🎉`;
  document.getElementById("winnerPopup").style.display = "block";
  launchConfetti();
  document.getElementById("winSound").play();
}

function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let pieces = [];
  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 2,
      speed: Math.random() * 3 + 1,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y += p.speed;
      if (p.y > canvas.height) p.y = -10;
    });
    requestAnimationFrame(draw);
  }

  draw();

  setTimeout(() => {
    pieces = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("winnerPopup").style.display = "none";
  }, 4000);
}

renderTable();
renderTitle();
