function analyzeText() {
  const input = document.getElementById("inputText").value;
  const lines = input.trim().split(/\n+/);
  const data = {};
  const markTypes = ["✅", "✔️"];

  lines.forEach(line => {
    const match = line.match(/\] (.*?):(.*)/);
    if (!match) return;
    const name = match[1].trim();
    const message = match[2].trim();
    const mark = markTypes.find(m => message.includes(m)) || "ללא סימון";

    if (!data[name]) data[name] = { count: 0, marks: {} };
    data[name].count++;
    data[name].marks[mark] = (data[name].marks[mark] || 0) + 1;
  });

  const output = Object.entries(data).map(([name, info]) => {
    const marks = Object.entries(info.marks).map(([m, c]) => `${m}: ${c}`).join(", ");
    return `${name} - ${info.count} הודעות | סימונים: ${marks}`;
  }).join("\n");

  document.getElementById("output").innerText = output;
}