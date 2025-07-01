import { db } from "./firebase.js";
import {
  ref,
  onValue,
  set,
  remove,
  push,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const userPhone = localStorage.getItem("userPhone");
const userName = localStorage.getItem("userName");
const isAdmin = localStorage.getItem("isAdmin") === "true";

if (!userPhone || !userName) {
  window.location.href = "index.html";
}

const userList = document.getElementById("userList");
const chatBox = document.getElementById("chatBox");
const messagesDiv = document.getElementById("messages");
const chatWith = document.getElementById("chatWith");
let currentChatUser = null;

// ✅ Mark as online
set(ref(db, `onlineUsers/${userPhone}`), true);
window.addEventListener("beforeunload", () => {
  remove(ref(db, `onlineUsers/${userPhone}`));
});

// ✅ Show users (excluding self & cactus)
function loadUsers() {
  onValue(ref(db, "users"), (snapshot) => {
    const usersData = snapshot.val() || {};
    onValue(ref(db, "onlineUsers"), (onlineSnap) => {
      const online = onlineSnap.val() || {};
      const users = [];

      for (const phone in usersData) {
        const user = usersData[phone];
        if (!user || user.phone === "cactus" || user.phone === userPhone) continue;
        user.isOnline = !!online[user.phone];
        users.push(user);
      }

      // অনলাইনরা আগে
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
  });
}
loadUsers();

// ✅ Start Chat
function startChat(user) {
  currentChatUser = user;
  chatBox.style.display = "block";
  chatWith.textContent = `চ্যাট করছেন: ${user.name}`;
  messagesDiv.innerHTML = "";

  const chatId = getChatId(userPhone, user.phone);
  const chatRef = ref(db, `messages/${chatId}`);
  onValue(chatRef, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((child) => {
      const msg = child.val();
      const div = document.createElement("div");
      const isMine = msg.from === userPhone;
      div.className = "message " + (isMine ? "mine" : "theirs");
      div.textContent = msg.text;

      if (isMine) {
        const delBtn = document.createElement("span");
        delBtn.textContent = "❌";
        delBtn.className = "delete-btn";
        delBtn.onclick = () => remove(ref(db, `messages/${chatId}/${child.key}`));
        div.appendChild(delBtn);
      }

      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// ✅ Send message
window.sendMessage = function () {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text || !currentChatUser) return;

  const chatId = getChatId(userPhone, currentChatUser.phone);
  const chatRef = ref(db, `messages/${chatId}`);
  push(chatRef, {
    text,
    from: userPhone,
    timestamp: serverTimestamp()
  });

  input.value = "";
};

function getChatId(a, b) {
  return [a, b].sort().join("_");
}
