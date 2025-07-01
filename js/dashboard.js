import { db, auth } from "./firebase.js";
import {
  ref,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    const phone = user.phoneNumber || localStorage.getItem("loginPhone");
    const name = localStorage.getItem("loginName");
    document.getElementById("userName").innerText = name || "ব্যবহারকারী";

    const onlineRef = ref(db, `online/${phone}`);
    update(onlineRef, { status: true });

    window.addEventListener("beforeunload", () => {
      update(onlineRef, { status: false });
    });

    loadUsers(phone);
  } else {
    window.location.href = "login.html";
  }
});

function loadUsers(currentPhone) {
  const usersRef = ref(db, "users");
  const onlineRef = ref(db, "online");

  onValue(usersRef, (snapshot) => {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    const users = snapshot.val() || {};

    onValue(onlineRef, (onlineSnap) => {
      const onlineUsers = onlineSnap.val() || {};

      // নাম গুলো সাজানো হবে: আগে অনলাইন, পরে অফলাইন
      const sortedUsers = Object.entries(users)
        .filter(([phone, data]) => phone !== currentPhone && phone !== "cactus") // নিজের ও cactus বাদ
        .sort(([phoneA], [phoneB]) => {
          const onlineA = onlineUsers[phoneA]?.status ? 1 : 0;
          const onlineB = onlineUsers[phoneB]?.status ? 1 : 0;
          return onlineB - onlineA;
        });

      for (const [phone, data] of sortedUsers) {
        const isOnline = onlineUsers[phone]?.status;

        const tr = document.createElement("tr");
        tr.className = "user-row";
        tr.innerHTML = `<td class="${isOnline ? "online" : "offline"}">${data.name}</td>`;

        tr.addEventListener("click", () => {
          window.location.href = `chat.html?to=${phone}`;
        });

        userList.appendChild(tr);
      }
    });
  });
}
