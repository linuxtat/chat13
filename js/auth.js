// js/auth.js
import { db } from "./firebase.js";
import { ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Handle Signup
window.handleSignup = async function () {
  const name = document.getElementById("signupName").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const msg = document.getElementById("signupMessage");

  if (!name || !phone) {
    msg.textContent = "নাম ও মোবাইল নাম্বার দিন।";
    return;
  }

  const snap = await get(ref(db, `signupRequests/${phone}`));
  const userSnap = await get(ref(db, `users/${phone}`));

  if (snap.exists() || userSnap.exists()) {
    msg.textContent = "এই নাম্বারে ইতিমধ্যেই অনুরোধ পাঠানো হয়েছে বা ইউজার আছেন।";
    return;
  }

  await set(ref(db, `signupRequests/${phone}`), {
    name,
    phone,
    status: "pending"
  });

  msg.textContent = "সাইন আপ অনুরোধ জমা হয়েছে। অনুমোদনের পর লগ ইন করতে পারবেন।";
};

// ✅ Handle Login
window.handleLogin = async function () {
  const name = document.getElementById("loginName").value.trim();
  const phone = document.getElementById("loginPhone").value.trim();
  const msg = document.getElementById("loginMessage");

  if (!name || !phone) {
    msg.textContent = "নাম ও মোবাইল নাম্বার দিন।";
    return;
  }

  if (name === "cactus" && phone === "cactus13") {
    localStorage.setItem("userPhone", "cactus");
    localStorage.setItem("userName", "cactus");
    localStorage.setItem("isAdmin", "true");
    window.location.href = "admin.html";
    return;
  }

  const userSnap = await get(ref(db, `users/${phone}`));
  if (!userSnap.exists()) {
    const reqSnap = await get(ref(db, `signupRequests/${phone}`));
    if (reqSnap.exists()) {
      msg.textContent = "আপনার সাইন আপ অনুরোধ এখনও অনুমোদিত হয়নি।";
    } else {
      msg.textContent = "আপনি এখনও সাইন আপ করেননি।";
    }
    return;
  }

  const user = userSnap.val();
  if (user.name !== name) {
    msg.textContent = "নাম ও নাম্বার মিলছে না।";
    return;
  }

  localStorage.setItem("userPhone", user.phone);
  localStorage.setItem("userName", user.name);
  localStorage.setItem("isAdmin", user.isAdmin ? "true" : "false");

  if (user.isAdmin) {
    window.location.href = "admin.html";
  } else {
    window.location.href = "dashboard.html";
  }
};
