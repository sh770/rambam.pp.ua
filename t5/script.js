function analyzeText() {
  const text = document.getElementById("textInput").value.trim();
  const errorEl = document.getElementById("error");
  const summaryEl = document.getElementById("summary");
  const detailsEl = document.getElementById("details");

  if (!text) {
    errorEl.innerText = "אנא הזן טקסט לניתוח";
    summaryEl.innerHTML = "";
    detailsEl.innerHTML = "";
    return;
  }

  errorEl.innerText = "";

  const lines = text.split('\n');
  const users = {};
  let pendingUser = null;

  lines.forEach((line, index) => {
    const match = line.match(/\] (.*?):(.*)/);
    if (match) {
      const name = match[1].trim();
      const content = match[2].trim();

      // בדיקה אם ההודעה היא רק סימון (למשל: [שעה] שם: ✅)
      const hasCheck = content.includes("✔️");
      const hasV = content.includes("✅");

      // אם זו הודעה עם תוכן (לא ריקה לגמרי)
      if (content || hasCheck || hasV) {
        let score = hasV ? 3 : hasCheck ? 2 : 1;

        if (!users[name]) {
          users[name] = {
            score: 0,
            messages: 0,
            checkCount: 0,
            vCount: 0
          };
        }

        users[name].score += score;
        users[name].messages += 1;
        if (hasCheck) users[name].checkCount += 1;
        if (hasV) users[name].vCount += 1;

        pendingUser = null; // reset
      } else {
        // נשמור את המשתמש – אולי שורת סימון תבוא בהמשך
        pendingUser = name;
      }
    } else if (pendingUser) {
      // מדובר בשורה בלי כותרת הודעה – אולי סימון? נחפש ✔️ או ✅
      const hasCheck = line.includes("✔️");
      const hasV = line.includes("✅");

      if (hasCheck || hasV) {
        let score = hasV ? 3 : hasCheck ? 2 : 1;

        if (!users[pendingUser]) {
          users[pendingUser] = {
            score: 0,
            messages: 0,
            checkCount: 0,
            vCount: 0
          };
        }

        users[pendingUser].score += score;
        users[pendingUser].messages += 1;
        if (hasCheck) users[pendingUser].checkCount += 1;
        if (hasV) users[pendingUser].vCount += 1;
      }

      pendingUser = null; // reset בכל מקרה
    }
  });

  const summaryRows = Object.entries(users)
    .map(([name, data]) => `<tr><td>${name}</td><td>${data.score}</td></tr>`)
    .join("");

  const detailsRows = Object.entries(users)
    .map(([name, data]) =>
      `<tr><td>${name}</td><td>${data.messages}</td><td>${data.checkCount}</td><td>${data.vCount}</td></tr>`)
    .join("");

  summaryEl.innerHTML = `
    <h2>טבלת ניקוד</h2>
    <table>
      <thead>
        <tr><th>שם</th><th>ניקוד</th></tr>
      </thead>
      <tbody>
        ${summaryRows}
      </tbody>
    </table>`;

  detailsEl.innerHTML = `
    <h2>טבלת פירוט</h2>
    <table>
      <thead>
        <tr><th>שם</th><th>מספר הודעות</th><th>✔️</th><th>✅</th></tr>
      </thead>
      <tbody>
        ${detailsRows}
      </tbody>
    </table>`;
}
