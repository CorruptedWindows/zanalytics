// Firebase configuration for Zapping Analytics v1

const firebaseConfig = {
  apiKey: "AIzaSyDovR7od9zq8tgWxBd_OzXoK-_IE1QgLnQ",
  authDomain: "zapping-analytics-v1.firebaseapp.com",
  databaseURL: "https://zapping-analytics-v1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zapping-analytics-v1",
  storageBucket: "zapping-analytics-v1.firebasestorage.app",
  messagingSenderId: "1014676384542",
  appId: "1:1014676384542:web:766d5a820b4c5aa848b70f",
  measurementId: "G-9RSCZ9JE27"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

window.firebaseDB = db;
window.firebaseRef = firebase.database().ref;
window.firebaseGet = firebase.database().ref; // ci serve un modo diverso, vediamo sotto

