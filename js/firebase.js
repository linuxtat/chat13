// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// আপনার Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkXlRiSBj6BhbSc7SY-p9ZYXZtUIX9LHY",
  authDomain: "chat-7a029.firebaseapp.com",
  databaseURL: "https://chat-7a029-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-7a029",
  storageBucket: "chat-7a029.appspot.com",
  messagingSenderId: "163196320554",
  appId: "1:163196320554:web:d18e5bff63b0c2b24ffc53",
  measurementId: "G-3YSTCGYVF5"
};

// Firebase ইনিশিয়ালাইজ
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
