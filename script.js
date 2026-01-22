
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
}
if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

document.getElementById("pdfInput").addEventListener("change", async function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str).join(" ");
      fullText += strings + "\n";
    }

    document.getElementById("resumeText").value = fullText;
  };

  reader.readAsArrayBuffer(file);
});

let chart = null;

function analyze() {
  const text = document.getElementById("resumeText").value.toLowerCase();
  const result = document.getElementById("result");

  if (text.length < 100) {
    result.innerHTML = "❌ Please upload or paste resume first.";
    return;
  }

  let sectionScore = 0;
  let skillScore = 0;
  let lengthScore = 0;
  let readabilityScore = 0;

  let feedback = [];

  const sections = ["education", "skills", "project", "experience", "certification", "summary", "objective"];
  let found = 0;

  sections.forEach(sec => {
    if (text.includes(sec)) found++;
  });

  sectionScore = Math.min(30, found * 5);

  if (found < 4) feedback.push("⚠️ Add more proper sections.");

  const words = text.split(/\s+/).length;

  if (words >= 200 && words <= 900) {
    lengthScore = 20;
  } else {
    feedback.push("⚠️ Resume length should be 1-2 pages.");
  }

  const skills = ["java", "python", "c++", "javascript", "html", "css", "react", "flutter", "firebase", "sql", "git"];
  let skillCount = 0;

  skills.forEach(s => {
    if (text.includes(s)) skillCount++;
  });

  skillScore = Math.min(30, skillCount * 4);

  if (skillCount < 4) feedback.push("⚠️ Add more technical skill keywords.");

  const sentences = text.split(/[.!?]/).length;
  const avg = words / sentences;

  if (avg < 20) {
    readabilityScore = 20;
  } else {
    feedback.push("⚠️ Sentences too long. Improve readability.");
  }

  const total = sectionScore + skillScore + lengthScore + readabilityScore;

  let html = `
    <h2>📊 Resume Score: ${total}/100</h2>
    <p>📝 Word Count: ${words}</p>
    <p>📖 Avg Words/Sentence: ${avg.toFixed(1)}</p>
    <h3>Suggestions:</h3>
  `;

  if (feedback.length === 0) {
    html += "<p>✅ Your resume looks great!</p>";
  } else {
    html += "<ul>";
    feedback.forEach(f => html += `<li>${f}</li>`);
    html += "</ul>";
  }

  result.innerHTML = html;

  const ctx = document.getElementById("scoreChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Sections", "Skills", "Length", "Readability"],
      datasets: [{
        label: "Score Breakdown",
        data: [sectionScore, skillScore, lengthScore, readabilityScore],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 30
        }
      }
    }
  });
}
