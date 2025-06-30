// js/admin.js
import { db } from "./firebase.js";
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const userPhone = localStorage.getItem("userPhone");
const isAdmin = userPhone === "0712499829";

if (!isAdmin) {
  alert("এই পেজে শুধু এডমিন প্রবেশ করতে পারে!");
  window.location.href = "index.html";
}

const userList = document.getElementById("userList");

const usersRef = ref(db, "users");
onValue(usersRef, (snapshot) => {
  const users = snapshot.val();
  userList.innerHTML = "";

  for (const phone in users) {
    const user = users[phone];
    const userDiv = document.createElement("div");
    userDiv.textContent = `${user.name} (${user.phone})`;

    // নিজেকে (এডমিন) বাদ দিয়ে ডিলিট বাটন দেখাও
    if (phone !== userPhone) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "ডিলিট";
      delBtn.onclick = () => {
        if (confirm(`${user.name} কে মুছে ফেলবেন?`)) {
          remove(ref(db, `users/${phone}`));
        }
      };
      userDiv.appendChild(delBtn);
    }

    userList.appendChild(userDiv);
  }
});
const allPostsDiv = document.getElementById("allPosts");
const allChatsDiv = document.getElementById("allChats");

// সব পোস্ট
const postsRef = ref(db, "posts");
onValue(postsRef, (snapshot) => {
  const posts = snapshot.val();
  allPostsDiv.innerHTML = "";

  for (const postId in posts) {
    const post = posts[postId];
    const postDiv = document.createElement("div");
    postDiv.style.border = "1px solid #aaa";
    postDiv.style.margin = "10px";
    postDiv.style.padding = "10px";
    postDiv.innerHTML = `<strong>${post.author}</strong>: ${post.text}`;

    const delPost = document.createElement("button");
    delPost.textContent = "পোস্ট ডিলিট";
    delPost.onclick = () => {
      if (confirm("পোস্ট মুছে ফেলবেন?")) {
        remove(ref(db, `posts/${postId}`));
        remove(ref(db, `comments/${postId}`));
      }
    };
    postDiv.appendChild(delPost);

    // কমেন্ট লোড
    const commentRef = ref(db, `comments/${postId}`);
    onValue(commentRef, (snap) => {
      const comments = snap.val();
      const cDiv = document.createElement("div");
      for (const cId in comments) {
        const c = comments[cId];
        const cLine = document.createElement("p");
        cLine.textContent = `${c.author}: ${c.text}`;

        const delC = document.createElement("button");
        delC.textContent = "❌";
        delC.onclick = () => {
          remove(ref(db, `comments/${postId}/${cId}`));
        };
        cLine.appendChild(delC);
        cDiv.appendChild(cLine);
      }
      postDiv.appendChild(cDiv);
    });

    allPostsDiv.appendChild(postDiv);
  }
});
// সব চ্যাট
const messagesRef = ref(db, "messages");
onValue(messagesRef, (snapshot) => {
  const all = snapshot.val();
  allChatsDiv.innerHTML = "";

  for (const chatId in all) {
    const chatDiv = document.createElement("div");
    chatDiv.style.border = "1px dashed gray";
    chatDiv.style.margin = "10px";
    chatDiv.style.padding = "10px";

    const title = document.createElement("h4");
    title.textContent = `চ্যাট (${chatId.replaceAll("_", " ⇄ ")})`;
    chatDiv.appendChild(title);

    const msgs = all[chatId];
    for (const msgId in msgs) {
      const m = msgs[msgId];
      const msgLine = document.createElement("p");
      msgLine.textContent = `${m.sender}: ${m.text}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "✖";
      delBtn.onclick = () => {
        remove(ref(db, `messages/${chatId}/${msgId}`));
      };

      msgLine.appendChild(delBtn);
      chatDiv.appendChild(msgLine);
    }

    allChatsDiv.appendChild(chatDiv);
  }
});
