// 🟠 Switch between tabs
function switchTab(tabId) {
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    event.target.classList.add("active");
}

// 🟠 Lottery logic
let participants = JSON.parse(localStorage.getItem("participants")) || [];
let lotteryTitle = localStorage.getItem("lotteryTitle") || "";

// Render table of participants
function renderTable() {
    const table = document.getElementById("participantsTable");
    table.innerHTML = `<tr><th>שם</th><th>כרטיסים</th><th>עדכון</th><th>מחיקה</th></tr>`;
    participants.forEach((p, i) => {
        table.innerHTML += `
      <tr>
        <td><input type="text" value="${p.name}" onchange="updateName(${i}, this.value)"></td>
        <td><input type="number" min="1" value="${p.tickets}" onchange="updateTickets(${i}, this.value)"></td>
        <td><button onclick="updateTickets(${i}, document.querySelectorAll('#participantsTable input')[${i * 2 + 1}].value)">שנה</button></td>
        <td><button onclick="removeParticipant(${i})">X</button></td>
      </tr>
    `;
    });
}

// Update number of tickets for a participant
function updateTickets(i, val) {
    const t = parseInt(val);
    if (!isNaN(t) && t > 0) {
        participants[i].tickets = t;
        localStorage.setItem("participants", JSON.stringify(participants));
        renderTable();
    }
}

// Update name of a participant
function updateName(i, val) {
    if (val.trim()) {
        participants[i].name = val.trim();
        localStorage.setItem("participants", JSON.stringify(participants));
    }
}

// Save the lottery title
function setLotteryTitle() {
    const val = document.getElementById("lotteryTitleInput").value.trim();
    if (!val) return;
    lotteryTitle = val;
    localStorage.setItem("lotteryTitle", lotteryTitle);
    renderTitle();
    document.getElementById("lotteryTitleInput").value = "";
}

// Display the lottery title
function renderTitle() {
    document.getElementById("lotteryTitleDisplay").innerText = lotteryTitle;
}

// Add a participant
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

// Remove participant by index
function removeParticipant(i) {
    participants.splice(i, 1);
    localStorage.setItem("participants", JSON.stringify(participants));
    renderTable();
}

// Reset all participants and title
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

// Draw random winner
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

// Confetti animation
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

// 🟢 WhatsApp Analysis
function analyze() {
    const text = document.getElementById("inputText").value;
    const lines = text.split("\n");
    const data = {};

    lines.forEach(line => {
        const match = line.match(/\[\d{1,2}\.\d{1,2}, \d{2}:\d{2}\] (.*?): (.*)/);
        if (match) {
            const sender = match[1].trim();
            const message = match[2].trim();
            const symbols = message.match(/✅|✔️|❌|⬅️|➡️|🔔|🔕|🟢|🔴/g) || [];

            if (!data[sender]) {
                data[sender] = { count: 0, symbols: {} };
            }

            data[sender].count++;
            if (symbols.length > 0) {
                symbols.forEach(sym => {
                    if (!data[sender].symbols[sym]) data[sender].symbols[sym] = 0;
                    data[sender].symbols[sym]++;
                });
            } else {
                if (!data[sender].symbols["(ללא סימון)"]) data[sender].symbols["(ללא סימון)"] = 0;
                data[sender].symbols["(ללא סימון)"]++;
            }
        }
    });

    let output = "";
    Object.entries(data).forEach(([sender, info]) => {
        output += `👤 ${sender}:\n`;
        output += `- מספר הודעות: ${info.count}\n`;
        output += `- סימונים:\n`;
        Object.entries(info.symbols).forEach(([s, c]) => {
            output += `  • ${s}: ${c}\n`;
        });
        output += `\n`;
    });

    document.getElementById("output").innerText = output || "לא נמצאו נתונים.";
}

// Initialize
renderTable();
renderTitle();
