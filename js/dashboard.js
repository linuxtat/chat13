import { db } from "./firebase.js";
import {
  ref, onValue, set, remove, push, serverTimestamp, off
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const userPhone = localStorage.getItem("userPhone");
const userName = localStorage.getItem("userName");

if (!userPhone || !userName) window.location.href = "index.html";

const userList = document.getElementById("userList");
const chatBox = document.getElementById("chatBox");
const messagesDiv = document.getElementById("messages");
const chatWith = document.getElementById("chatWith");
const chatInput = document.getElementById("chatInput");
const typingStatus = document.getElementById("typingStatus");
const notificationSound = document.getElementById("notificationSound");

let currentChatUser = null;
let currentChatRef = null;

// ✅ Mark user online
set(ref(db, `onlineUsers/${userPhone}`), true);
window.addEventListener("beforeunload", () => {
  remove(ref(db, `onlineUsers/${userPhone}`));
  remove(ref(db, `typing/${userPhone}`));
});

// ✅ Load all users
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

      users.sort((a, b) => b.isOnline - a.isOnline);
      userList.innerHTML = "";
      users.forEach(user => {
        const tr = document.createElement("tr");
        tr.className = user.isOnline ? "online" : "offline";
        tr.innerHTML = `<td>${user.name}</td>`;
        tr.onclick = () => startChat(user);
        userList.appendChild(tr);
      });
    });
  });
}
loadUsers();

function startChat(user) {
  currentChatUser = user;
  chatBox.style.display = "block";
  chatWith.textContent = `চ্যাট করছেন: ${user.name}`;
  messagesDiv.innerHTML = "";
  typingStatus.textContent = "";

  const chatId = getChatId(userPhone, user.phone);

  if (currentChatRef) off(currentChatRef);
  currentChatRef = ref(db, `messages/${chatId}`);

  onValue(currentChatRef, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(child => {
      const msg = child.val();
      const div = document.createElement("div");
      const isMine = msg.from === userPhone;
      div.className = "message " + (isMine ? "mine" : "theirs");

      div.innerHTML = `
        ${msg.text}
        <div class="timestamp">${msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}</div>
      `;

      if (!isMine) {
      if (notificationSound) {
        notificationSound.volume = 0.3;
        notificationSound.currentTime = 0;
        notificationSound.play();
      }
      if (navigator.vibrate) navigator.vibrate(100);
    }

    if (isMine) {
      const delBtn = document.createElement("span");
      delBtn.textContent = "❌";
      delBtn.className = "delete-btn";
      delBtn.onclick = () =>
        remove(ref(db, `messages/${chatId}/${child.key}`));
      div.appendChild(delBtn);
      }

      messagesDiv.appendChild(div);

      
    
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Typing Indicator
  const typingRef = ref(db, `typing/${user.phone}`);
  onValue(typingRef, (snap) => {
    const isTyping = snap.val();
    typingStatus.textContent = isTyping ? `${user.name} টাইপ করছেন...` : "";
  });
}

window.sendMessage = function () {
  const text = chatInput.value.trim();
  if (!text || !currentChatUser) return;

  const chatId = getChatId(userPhone, currentChatUser.phone);
  push(ref(db, `messages/${chatId}`), {
    text,
    from: userPhone,
    timestamp: Date.now()
  });

  chatInput.value = "";
  set(ref(db, `typing/${userPhone}`), false);
};

function getChatId(a, b) {
  return [a, b].sort().join("_");
}

// Typing indicator handling
let typingTimer;
chatInput.addEventListener("input", () => {
  if (!currentChatUser) return;
  set(ref(db, `typing/${userPhone}`), true);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    set(ref(db, `typing/${userPhone}`), false);
  }, 1500);
});

// Enter to send
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
