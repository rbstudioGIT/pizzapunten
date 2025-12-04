const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRzc9wFULPeDX3JrH_9swutuqkgz03AYoZ1xaAJ3piIcE0hPijMPRbD9XYHh--cm_6wO7U9MCQcHOO/pub?gid=0&single=true&output=csv";
const REFRESH_INTERVAL_MS = 30000; // 30 seconden
const COLS = {
  date: "Datum",
  player: "Speler",
  present: "Aanwezig",
  winner: "Winnaar",
  injured: "Geblesseerd"
};

// Kleurenpalet voor de grafiek (consistent met CSS)
const CHART_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316',
  '#ec4899', '#14b8a6', '#84cc16', '#d946ef', '#0ea5e9', '#f43f5e'
];
 
let records = [], totals = {}, sessionsByDate = {}, chart;

const lb = document.getElementById("leaderboard"),
      pizzaLine = document.getElementById("pizza-line"),
      mtbName = document.getElementById("mtb-name"),
      mtbPoints = document.getElementById("mtb-points"),
      mivName = document.getElementById("miv-name"),
      mivDelta = document.getElementById("miv-delta"),
      totalSessions = document.getElementById("total-sessions"),
      bestWinRatePlayerName = document.getElementById("best-winrate-name"),
      bestWinRatePercentage = document.getElementById("best-winrate-percentage"),
      mostPresentName = document.getElementById("most-present-name"),
      leastPresentName = document.getElementById("least-present-name"),
      dataTbody = document.querySelector("#data-table tbody");

// Helper functie om boolean-achtige waarden te checken
const isTrue = v => ["1", "ja", "true", "y", "yes"].includes(String(v).trim().toLowerCase());

// Bereken punten voor een record
const calcPoints = r => {
  const injuredVal = String(r.injured).trim().toLowerCase();
  // Herken nu ook expliciet "0.5" als geblesseerd
  if (isTrue(injuredVal) || injuredVal === "0.5") return 0.5;
  if (isTrue(r.present)) return 1 + (isTrue(r.winner) ? 1 : 0);
  return 0;
};

async function fetchCSV() {
  try {
    const res = await fetch(`${CSV_URL}&t=${Date.now()}`); // Cache bust
    if (!res.ok) throw new Error("Sheet laden mislukt: " + res.status);
    return await res.text();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; // Re-throw om de refresh te stoppen bij fetch fail
  }
}

function parseData(csv) {
  const p = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().replace(/,$/, "") // Trim header spaties/komma's
  });

  if (p.errors.length > 0) {
    console.warn("PapaParse errors:", p.errors);
  }

  // Filter ongeldige rijen en parse data
  records = p.data
    .filter(r => r[COLS.date] && r[COLS.player]) // Zorg dat datum en speler bestaan
    .map(r => {
      let date = new Date(r[COLS.date]); // Gebruik de standaard Date constructor
      if (isNaN(date.getTime())) {
        console.warn("Ongeldige datum gevonden:", r[COLS.date], "Record:", r);
        date = new Date(0); // Zet op epoch of skip record?
      }
      return {
        date: date,
        player: r[COLS.player].trim(),
        present: r[COLS.present] || "nee",
        winner: r[COLS.winner] || "nee",
        injured: r[COLS.injured] || "nee",
        points: 0 // Wordt hieronder berekend
      };
    })
    .filter(r => r.date.getTime() !== 0) // Filter records met ongeldige datum
    .map(rec => {
      const points = calcPoints(rec);
      return { ...rec, points }; // Bereken punten
    });

  // Sorteer records op datum (oud naar nieuw)
  records.sort((a, b) => a.date - b.date);

  // Herbereken totalen en sessies
  totals = {};
  sessionsByDate = {};

  records.forEach(r => {
    // Update totaal per speler
    const currentTotal = totals[r.player] || 0;
    totals[r.player] = currentTotal + r.points;

    // Update sessies per datum (ISO string als key)
    const dateKey = r.date.toISOString().split("T")[0];
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = {};
    }
    sessionsByDate[dateKey][r.player] = (sessionsByDate[dateKey][r.player] || 0) + r.points;
  });
}

function renderLeaderboard() {
  // Verwijder oude rijen, behalve de pizza-lijn
  lb.querySelectorAll(".lb-row").forEach(e => e.remove());

  const entries = Object.entries(totals)
      .sort(([, ptsA], [, ptsB]) => ptsB - ptsA); // Sorteer op punten (hoog -> laag)

  const halfIndex = Math.ceil(entries.length / 2);

  entries.forEach(([player, points], index) => {
    const rank = index + 1;
    lb.insertAdjacentHTML("beforeend", `
      <div class="lb-row lb-rank">${rank}.</div>
      <div class="lb-row lb-name" title="${player}">${player}</div>
      <div class="lb-row lb-points">${points % 1 === 0 ? points : points.toFixed(1)}</div>
    `);
  });

  // Update pizza lijn positie
  const rows = lb.querySelectorAll('.lb-row.lb-rank');
  if (rows.length > 0 && halfIndex < rows.length) {
      const targetRow = rows[halfIndex];
      const leaderboardTop = lb.getBoundingClientRect().top;
      const targetRowTop = targetRow.getBoundingClientRect().top;
      const relativeTop = targetRowTop - leaderboardTop - 2;
      pizzaLine.style.top = `${relativeTop}px`;
      pizzaLine.style.opacity = '0.5';
  } else if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
       const leaderboardTop = lb.getBoundingClientRect().top;
      const lastRowBottom = lastRow.getBoundingClientRect().bottom;
       const relativeBottom = lastRowBottom - leaderboardTop + 2;
       pizzaLine.style.top = `${relativeBottom}px`;
       pizzaLine.style.opacity = '0.5';
  } else {
    pizzaLine.style.opacity = '0';
  }

  // Update "Man to Beat" kaart
  if (entries.length > 0) {
    mtbName.textContent = entries[0][0];
    mtbPoints.textContent = `${entries[0][1] % 1 === 0 ? entries[0][1] : entries[0][1].toFixed(1)} pts`;
  } else {
    mtbName.textContent = "—";
    mtbPoints.textContent = "— pts";
  }
}

function renderManInVorm() {
  const sortedDates = Object.keys(sessionsByDate).sort();
  if (sortedDates.length < 2) {
      mivName.textContent = "—";
      mivDelta.textContent = "— pts";
      mivDelta.className = "delta";
      return;
  }

  const last3Dates = sortedDates.slice(-3);
  const prev3Dates = sortedDates.slice(Math.max(0, sortedDates.length - 6), -3);

  const sumPointsForDates = (dateKeys) => {
    const playerTotals = {};
    dateKeys.forEach(dateKey => {
      Object.entries(sessionsByDate[dateKey] || {}).forEach(([player, points]) => {
        playerTotals[player] = (playerTotals[player] || 0) + points;
      });
    });
    return playerTotals;
  };

  const last3Points = sumPointsForDates(last3Dates);
  const prev3Points = sumPointsForDates(prev3Dates);

  const playerDeltas = Object.keys(last3Points).map(player => ({
    player: player,
    delta: last3Points[player] - (prev3Points[player] || 0)
  }));

  playerDeltas.sort((a, b) => b.delta - a.delta);

  if (playerDeltas.length > 0 && playerDeltas[0].delta !== 0) {
      const topPlayer = playerDeltas[0];
      const deltaValue = topPlayer.delta % 1 === 0 ? topPlayer.delta : topPlayer.delta.toFixed(1);
      const sign = topPlayer.delta > 0 ? "+" : "";
      mivName.textContent = topPlayer.player;
      mivDelta.textContent = `${sign}${deltaValue} pts`;
      mivDelta.className = `delta ${topPlayer.delta > 0 ? 'positive' : 'negative'}`;
  } else {
      mivName.textContent = "—";
      mivDelta.textContent = "— pts";
      mivDelta.className = "delta";
  }
}


function renderTotalSessions() {
  totalSessions.textContent = Object.keys(sessionsByDate).length;
}

function renderChart() {
  const ctx = document.getElementById("pointsChart").getContext("2d");
  const sortedDates = Object.keys(sessionsByDate).sort();
  const players = Object.keys(totals);

  const datasets = players.map((player, index) => {
    let cumulativePoints = 0;
    const dataPoints = sortedDates.map(dateKey => {
      cumulativePoints += (sessionsByDate[dateKey][player] || 0);
      return cumulativePoints;
    });

    return {
      label: player,
      data: dataPoints,
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + '33',
      tension: 0.3,
      fill: false,
      borderWidth: 2,
      pointRadius: 1,
      pointHoverRadius: 5
    };
  });

  const labels = sortedDates.map(d => new Date(d).toLocaleDateString());

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: true,
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'white',
            padding: 20,
            boxWidth: 15,
          }
        },
        tooltip: {
          backgroundColor: 'var(--card-hover)',
          titleColor: 'white',
          bodyColor: 'white',
          boxPadding: 5,
          padding: 10,
          borderColor: 'var(--accent)',
          borderWidth: 1
        },
      },
      scales: {
        x: {
          title: {
            display: false,
          },
          ticks: {
            color: 'white',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          },
          grid: {
            color: 'var(--border)',
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cumulatieve Punten',
            color: 'white',
          },
          ticks: {
            color: 'white',
          },
          grid: {
            color: 'var(--border)',
          },
          beginAtZero: true
        }
      }
    }
  });
}


function renderTable() {
  dataTbody.innerHTML = "";
  records.forEach(r => {
    if (r.points > 0) {
        dataTbody.insertAdjacentHTML("beforeend", `
          <tr>
            <td>${r.date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'numeric', day: 'numeric' })}</td>
            <td>${r.player}</td>
            <td>${r.points % 1 === 0 ? r.points : r.points.toFixed(1)}</td>
          </tr>
        `);
    }
  });
}

const winRatio = player => {
  const wins = records.filter(r => r.player===player && isTrue(r.winner)).length;
  const attended = records.filter(r => r.player===player && isTrue(r.present)).length;
  return attended ? wins / attended : 0;
};

async function refresh() {
  console.log("Refreshing data...");
  try {
    const csvData = await fetchCSV();
    parseData(csvData);
    renderLeaderboard();
    renderManInVorm();
    renderTotalSessions();
    renderChart();
    bestWinratePlayer = records.map(r => r.player).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => winRatio(b) - winRatio(a))[0];
    bestWinRatePercentage.textContent = `${(winRatio(bestWinratePlayer)*100).toFixed(0)} %`;
    bestWinRatePlayerName.textContent = bestWinratePlayer;

    const playerPresence = {};
    records.filter(r=> isTrue(r.present)).forEach(r => {
        playerPresence[r.player] = (playerPresence[r.player] || 0) + 1;
    });

    const mostPresent = Object.entries(playerPresence).sort(([, a], [, b]) => b - a)[0]?.[0] || '—';
    const leastPresent = Object.entries(playerPresence).sort(([, a], [, b]) => a - b)[0]?.[0] || '—';

    mostPresentName.textContent = mostPresent;
    leastPresentName.textContent = leastPresent;

    renderTable();
    console.log("Refresh complete.");
  } catch (e) {
    console.error("Dashboard refresh failed:", e);
    // document.getElementById('error-message').textContent = "Kon data niet laden.";
  }
}
//mobile app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('SW registered'))
    .catch(err => console.error('SW registration failed:', err));
}
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
  });
});

function isIosSafari() {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/chrome/.test(ua);
}

function isInStandaloneMode() {
  return 'standalone' in window.navigator && window.navigator.standalone;
}

// Alleen tonen als:
// - iOS Safari
// - Niet al als app geïnstalleerd
// - Gebruiker heeft 'm niet weggeklikt
if (isIosSafari() && !isInStandaloneMode() && !localStorage.getItem('iosPromptDismissed')) {
  const iosPrompt = document.createElement("div");
  iosPrompt.innerHTML = `
    <div class="ios-install-banner">
      📱 Tik op <strong>Deel</strong> en kies <strong>'Zet op beginscherm'</strong> om deze app te installeren.
      <span class="close-ios-banner">×</span>
    </div>
  `;
  document.body.appendChild(iosPrompt);

  document.querySelector(".close-ios-banner").onclick = () => {
    iosPrompt.remove();
    localStorage.setItem('iosPromptDismissed', 'true'); // Voorkom herhaling
  };
}


refresh();
setInterval(refresh, REFRESH_INTERVAL_MS);