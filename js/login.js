import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

window.handleLogin = async function () {
  const name = document.getElementById("loginName").value.trim();
  const phone = document.getElementById("loginPhone").value.trim();
  const loginMessage = document.getElementById("loginMessage");

  if (!name || !phone) {
    loginMessage.textContent = "সব ঘর পূরণ করুন।";
    return;
  }

  try {
    const snapshot = await get(ref(db, `users/${phone}`));
    if (snapshot.exists()) {
      const user = snapshot.val();
      if (user.name === name) {
        localStorage.setItem("userPhone", phone);
        localStorage.setItem("userName", name);
        localStorage.setItem("isAdmin", user.isAdmin || false);
        window.location.href = user.isAdmin ? "admin.html" : "dashboard.html";
      } else {
        loginMessage.textContent = "নাম বা নম্বর ভুল।";
      }
    } else {
      loginMessage.textContent = "আপনার সাইন আপ এখনো অ্যাপ্রুভ হয়নি।";
    }
  } catch (err) {
    console.error(err);
    loginMessage.textContent = "ত্রুটি হয়েছে। আবার চেষ্টা করুন।";
  }
};
