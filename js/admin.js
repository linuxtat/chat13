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
