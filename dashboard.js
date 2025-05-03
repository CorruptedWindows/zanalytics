let chartInstance = null;
let locationChartInstance = null;
let lastLocationData = "";
let cachedLocationData = null;

document.addEventListener("DOMContentLoaded", () => {
  listenToDashboard();
  listenToLocationChanges();
  window.api.onTrafficAlert((amount) => {
    const alertBox = document.createElement('div');
    alertBox.className = 'traffic-alert';
    alertBox.innerText = `⚠️ Traffico elevato rilevato: +${amount} accessi`;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 10000);
  });  
});

function showSection(sectionId) {
  const activeSection = document.querySelector(".section.active");
  const nextSection = document.getElementById(sectionId);

  if (activeSection !== nextSection) {
    activeSection.classList.remove("active");
    activeSection.classList.add("fade-out");

    setTimeout(() => {
      activeSection.classList.remove("fade-out");
      nextSection.classList.add("active");

      // Sezione "Traffico Web" attivata, disegna il grafico
      if (sectionId === "statistics" && cachedLocationData) {
        createLocationChart(cachedLocationData);
        console.log("[Zapping Analytics] Grafico ricaricato manualmente.");
      }
    }, 400);
  }
}

// Ascolta gli aggiornamenti alle visite
function listenToDashboard() {
  const ref = firebase.database().ref('ZappingAnalytics');
  ref.on('value', snapshot => {
    if (snapshot.exists()) {
      const newData = snapshot.val();
      const oldData = JSON.stringify(window.latestData || {});
      const incoming = JSON.stringify(newData);

      if (incoming !== oldData) {
        window.latestData = newData;
        createChart(newData);
        populateTable(newData);
        console.log("[Zapping Analytics] Dati aggiornati.");
      }
    }
  });
}

// Ascolta aggiornamenti alla location solo se sezione aperta
function listenToLocationChanges() {
  const locRef = firebase.database().ref('ZappingAnalytics_Locations');
  locRef.on('value', snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const strData = JSON.stringify(data);

      if (strData !== lastLocationData) {
        lastLocationData = strData;
        cachedLocationData = data;

        const activeSection = document.querySelector(".section.active");
        if (activeSection && activeSection.id === "statistics") {
          createLocationChart(data);
          console.log("[Zapping Analytics] Origine traffico aggiornata.");
        }
      }
    }
  });
}

function createChart(data) {
  const chartCanvas = document.getElementById('chart');
  if (!chartCanvas || !chartCanvas.getContext) return;

  const ctx = chartCanvas.getContext('2d');
  const labels = Object.keys(data);
  const values = Object.values(data);

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(30, 144, 255, 0.6)');
  gradient.addColorStop(1, 'rgba(30, 144, 255, 0.05)');

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Visite',
        data: values,
        fill: true,
        backgroundColor: gradient,
        borderColor: '#1E90FF',
        borderWidth: 3,
        pointBackgroundColor: '#1E90FF',
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 20 },
      animation: { duration: 1500, easing: 'easeInOutCubic' },
      scales: {
        x: {
          ticks: { color: '#ccc', font: { weight: 'bold' } },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          ticks: { color: '#ccc', font: { weight: 'bold' } },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      },
      plugins: {
        tooltip: {
          backgroundColor: '#1E90FF',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderWidth: 1,
          borderColor: '#ccc'
        },
        legend: {
          labels: { color: '#ccc' }
        }
      }
    }
  });
}

function createLocationChart(data) {
  const chartCanvas = document.getElementById('locationChart');
  if (!chartCanvas || !chartCanvas.getContext) return;

  const ctx = chartCanvas.getContext('2d');
  const labels = Object.keys(data);
  const values = Object.values(data);

  if (locationChartInstance) locationChartInstance.destroy();

  locationChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Origine Traffico',
        data: values,
        backgroundColor: [
          '#1E90FF',
          '#4fa7ff',
          '#66ccff',
          '#3399ff',
          '#0073e6',
          '#0059b3',
          '#003d80',
          '#001f4d'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#ccc' } }
      }
    }
  });
}

function populateTable(data) {
  const tbody = document.querySelector("#pagesTable tbody");
  tbody.innerHTML = "";
  for (const [page, visits] of Object.entries(data)) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${page}</td><td>${visits}</td>`;
    tbody.appendChild(tr);
  }
}

function exportData() {
  const dataStr = JSON.stringify(window.latestData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "zapping_analytics_data.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
