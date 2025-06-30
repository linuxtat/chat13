// js/admin.js
import { db } from "./firebase.js";
import { ref, get, remove, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const requestList = document.getElementById("requestList");
const userList = document.getElementById("userList");

const currentUserPhone = localStorage.getItem("userPhone");
const isAdmin = localStorage.getItem("isAdmin");

if (currentUserPhone !== "cactus" && isAdmin !== "true") {
  alert("শুধুমাত্র এডমিন এই পেজে প্রবেশ করতে পারে!");
  window.location.href = "index.html";
}

// ✅ সাইন আপ রিকোয়েস্ট লোড
onValue(ref(db, "signupRequests"), (snapshot) => {
  requestList.innerHTML = "";
  snapshot.forEach((child) => {
    const user = child.val();
    const li = document.createElement("li");
    li.innerHTML = `
      ${user.name} (${user.phone}) 
      <button onclick="approve('${user.phone}', '${user.name}')">✔️ Accept</button>
      <button onclick="reject('${user.phone}')">❌ Reject</button>
    `;
    requestList.appendChild(li);
  });
});

// ✅ ইউজার তালিকা লোড
onValue(ref(db, "users"), (snapshot) => {
  userList.innerHTML = "";
  snapshot.forEach((child) => {
    const user = child.val();
    const li = document.createElement("li");

    let adminButton = "";
    if (user.phone === "cactus") {
      adminButton = "<strong>মূল এডমিন</strong>";
    } else if (user.isAdmin) {
      adminButton = `<button onclick="removeAdmin('${user.phone}')">Remove Admin</button>`;
    } else {
      adminButton = `<button onclick="makeAdmin('${user.phone}')">Make Admin</button>`;
    }

    li.innerHTML = `${user.name} (${user.phone}) ${adminButton}`;
    userList.appendChild(li);
  });
});

// ✅ Approve Function
window.approve = async function (phone, name) {
  await set(ref(db, `users/${phone}`), {
    name,
    phone,
    isAdmin: false
  });
  await remove(ref(db, `signupRequests/${phone}`));
};

// ✅ Reject Function
window.reject = async function (phone) {
  await remove(ref(db, `signupRequests/${phone}`));
};

// ✅ Make Admin
window.makeAdmin = async function (phone) {
  await update(ref(db, `users/${phone}`), {
    isAdmin: true
  });
};

// ✅ Remove Admin
window.removeAdmin = async function (phone) {
  if (phone === "cactus") {
    alert("মূল এডমিনকে বাদ দেয়া যাবে না!");
    return;
  }
  await update(ref(db, `users/${phone}`), {
    isAdmin: false
  });
};
