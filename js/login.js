// js/login.js
import { db } from "./firebase.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

window.handleLogin = function () {
  const name = document.getElementById("loginName").value.trim();
  const phone = document.getElementById("loginPhone").value.trim();

  if (name === "" || phone === "") {
    alert("দয়া করে নাম ও মোবাইল নম্বর দিন");
    return;
  }

  // ইউজার ইনফো ডাটাবেজে সেভ
  const userRef = ref(db, `users/${phone}`);
  set(userRef, {
    name: name,
    phone: phone,
    lastActive: new Date().toISOString()
  }).then(() => {
    localStorage.setItem("userPhone", phone); // লোকালি ফোন নম্বর সেভ
    window.location.href = "chat.html"; // চ্যাট পেজে নিয়ে যাওয়া
  }).catch((error) => {
    console.error("লগইন ব্যর্থ:", error);
    alert("লগইন করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
  });
};
