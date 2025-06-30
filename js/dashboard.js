// js/dashboard.js
import { db } from "./firebase.js";
import {
  ref,
  onValue,
  set,
  remove,
  push,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const userName = localStorage.getItem("userName");
const userPhone = localStorage.getItem("userPhone");
const isAdmin = localStorage.getItem("isAdmin") === "true";

if (!userName || !userPhone || isAdmin) {
  alert("এই পেজ কেবল সাধারণ ইউজারদের জন্য।");
  window.location.href = "index.html";
}

document.getElementById("userName").textContent = userName;

const userList = document.getElementById("userList");
const chatBox = document.getElementById("chatBox");
const chatWith = document.getElementById("chatWith");
const messagesDiv = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");
let chattingWith = null;

// অনলাইন স্ট্যাটাস আপডেট করুন
set(ref(db, `onlineUsers/${userPhone}`), true);
window.addEventListener("beforeunload", () => {
  remove(ref(db, `onlineUsers/${userPhone}`));
});

// ইউজার তালিকা লোড করুন
onValue(ref(db, "users"), async (snapshot) => {
  const onlineSnap = await get(ref(db, "onlineUsers"));
  const onlineList = onlineSnap.exists() ? Object.keys(onlineSnap.val()) : [];

  let users = [];
  snapshot.forEach(child => {
    const user = child.val();
    if (user.phone !== "cactus") {
      const isOnline = onlineList.includes(user.phone);
      users.push({ ...user, isOnline });
    }
  });

  // অনলাইনেরা আগে
  users.sort((a, b) => b.isOnline - a.isOnline);

  userList.innerHTML = "";
  users.forEach(user => {
    const tr = document.createElement("tr");
    tr.className = user.isOnline ? "online" : "offline";
    tr.innerHTML = `<td style="cursor:pointer">${user.name}</td>`;
    tr.onclick = () => startChat(user);
    userList.appendChild(tr);
  });
});

function startChat(user) {
  chattingWith = user;
  chatWith.textContent = user.name;
  chatBox.style.display = "block";
  messagesDiv.innerHTML = "লোড হচ্ছে...";

  const chatId = userPhone < user.phone ? `${userPhone}_${user.phone}` : `${user.phone}_${userPhone}`;
  const chatRef = ref(db, `messages/${chatId}`);

  onValue(chatRef, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((child) => {
      const msg = child.val();
      const div = document.createElement("div");
      div.className = "message" + (msg.from === userPhone ? " mine" : "");
      div.innerHTML = `${msg.text}`;

      if (msg.from === userPhone) {
        const delBtn = document.createElement("span");
        delBtn.textContent = "❌";
        delBtn.className = "delete-btn";
        delBtn.onclick = () => remove(ref(db, `messages/${chatId}/${child.key}`));
        div.appendChild(delBtn);
      }

      messagesDiv.appendChild(div);
    });
  });
}

window.sendMessage = function () {
  const text = chatInput.value.trim();
  if (!text || !chattingWith) return;

  const toPhone = chattingWith.phone;
  const chatId = userPhone < toPhone ? `${userPhone}_${toPhone}` : `${toPhone}_${userPhone}`;

  push(ref(db, `messages/${chatId}`), {
    text,
    from: userPhone,
    to: toPhone,
    time: Date.now()
  });

  chatInput.value = "";
};
