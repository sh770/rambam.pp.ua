function analyzeText() {
  const input = document.getElementById("messageInput").value.trim();
  const errorDiv = document.getElementById("error");
  const outputTable = document.getElementById("outputTable");

  errorDiv.textContent = "";
  outputTable.innerHTML = "";

  if (!input) {
    errorDiv.textContent = "אנא הדבק טקסט לניתוח.";
    return;
  }

  const lines = input.split(/\r?\n/);
  const fullMessages = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // If this line is a marking line (✔️/✅), append to previous message
    if ((line === "✔️" || line === "✅") && fullMessages.length > 0) {
      fullMessages[fullMessages.length - 1] += " " + line;
    } else if (line !== "") {
      fullMessages.push(line);
    }
  }

  const data = {};

  fullMessages.forEach((line) => {
    const match = line.match(/\] (.+?):/);
    if (!match) return;

    const name = match[1].trim();
    let score = 1;

    if (line.includes("✅")) score = 3;
    else if (line.includes("✔️")) score = 2;

    if (!data[name]) {
      data[name] = { count: 0, total: 0 };
    }

    data[name].count++;
    data[name].total += score;
  });

  const rows = Object.entries(data)
    .map(([name, stats]) => {
      return `<tr>
        <td>${name}</td>
        <td>${stats.count}</td>
        <td>${stats.total}</td>
      </tr>`;
    })
    .join("");

  outputTable.innerHTML = `
    <thead>
      <tr>
        <th>שם שולח</th>
        <th>מספר הודעות</th>
        <th>סה״כ ניקוד</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  `;
}
