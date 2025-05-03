const firebase = require('firebase/compat/app');
require('firebase/compat/database');
const nodemailer = require('nodemailer');

const firebaseConfig = {
  apiKey: "AIzaSyDovR7od9zq8tgWxBd_OzXoK-_IE1QgLnQ",
  authDomain: "zapping-analytics-v1.firebaseapp.com",
  databaseURL: "https://zapping-analytics-v1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zapping-analytics-v1",
  storageBucket: "zapping-analytics-v1.appspot.com",
  messagingSenderId: "1014676384542",
  appId: "1:1014676384542:web:766d5a820b4c5aa848b70f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === CONFIGURAZIONE ===
const INTERVAL_MS = 1000;     // ogni secondo
const WINDOW_SIZE = 10;       // 10 secondi
const THRESHOLD = 100;        // soglia di accessi in 10s

// === Setup email ===
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zappingemailer@gmail.com',
    pass: 'pqkjyzlmrnvarzyd'
  }
});

let visitWindow = [];
let alertSent = false;

function checkTrafficSpike() {
  db.ref('ZappingAnalytics').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return;

      const totalVisits = Object.values(data).reduce((a, b) => a + b, 0);
      visitWindow.push(totalVisits);

      if (visitWindow.length > WINDOW_SIZE) visitWindow.shift();

      if (visitWindow.length === WINDOW_SIZE) {
        const diff = visitWindow[WINDOW_SIZE - 1] - visitWindow[0];

        if (diff >= THRESHOLD && !alertSent) {
          alertSent = true;
          sendAlert(diff);
          setTimeout(() => alertSent = false, 5 * 60 * 1000); // blocco di 5 minuti tra alert
        }
      }
    })
    .catch(console.error);
}

function sendAlert(aumento) {

  process.send && process.send({ type: 'alert', amount: aumento });

  const mailOptions = {
    from: 'zappingemailer@gmail.com',
    to: 'zappingblogteam@gmail.com',
    subject: '⚠️ Traffico sospetto su Zapping Analytics',
    html: `
      <h2 style="color:#1E90FF;font-family:sans-serif;">Zapping Analytics Alert</h2>
      <p>🚀 Traffico aumentato di <strong>${aumento}</strong> accessi negli ultimi 10 secondi.</p>
      <p>Controlla se è tutto ok. Potrebbe trattarsi di un evento virale o di traffico sospetto.</p>
      <p style="font-size:12px;color:#888">Messaggio automatico generato da Zapping Alert System</p>
    `
  };

  transporter.sendMail(mailOptions)
    .then(() => console.log(`[ALERT] Mail inviata per +${aumento} accessi.`))
    .catch(console.error);
}

// Avvia il monitoraggio
setInterval(checkTrafficSpike, INTERVAL_MS);