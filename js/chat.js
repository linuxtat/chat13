// js/chat.js
import { db } from "./firebase.js";
import {
  ref,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// লোকাল স্টোরেজ থেকে ইউজারের মোবাইল নাম্বার
const userPhone = localStorage.getItem("userPhone");
if (!userPhone) {
  alert("আপনি লগইন করেননি");
  window.location.href = "index.html";
}

let selectedUser = null;

const userListDiv = document.getElementById("userList");
const messagesDiv = document.getElementById("messages");
const chatBox = document.getElementById("chatBox");
const chatWith = document.getElementById("chatWith");

// ইউজার তালিকা দেখাও (Firebase থেকে)
const usersRef = ref(db, "users");
onValue(usersRef, (snapshot) => {
  const users = snapshot.val();
  userListDiv.innerHTML = "";

  for (const phone in users) {
    if (phone === userPhone) continue; // নিজেকে বাদ দাও

    const user = users[phone];
    const btn = document.createElement("button");
    btn.textContent = `${user.name} (${user.phone})`;
    btn.onclick = () => startChatWith(phone, user.name);
    userListDiv.appendChild(btn);
  }
});

// চ্যাট শুরু
function startChatWith(otherPhone, otherName) {
  selectedUser = otherPhone;
  chatBox.style.display = "block";
  chatWith.textContent = `চ্যাট করছেন: ${otherName}`;

  const chatId = getChatId(userPhone, otherPhone);
  const msgRef = ref(db, `messages/${chatId}`);

  onValue(msgRef, (snapshot) => {
    const messages = snapshot.val();
    messagesDiv.innerHTML = "";
    for (const key in messages) {
      const msg = messages[key];
      const line = document.createElement("div");
      line.textContent = `${msg.sender === userPhone ? "আপনি" : otherName}: ${msg.text}`;
      messagesDiv.appendChild(line);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// মেসেজ পাঠানো
window.sendMessage = function () {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (text === "" || !selectedUser) return;

  const chatId = getChatId(userPhone, selectedUser);
  const msgRef = ref(db, `messages/${chatId}`);
  push(msgRef, {
    sender: userPhone,
    text: text,
    time: Date.now()
  });
  input.value = "";
};

// ইউনিক চ্যাট আইডি (phone1_phone2)
function getChatId(a, b) {
  return [a, b].sort().join("_");
}
