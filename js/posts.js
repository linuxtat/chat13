// js/posts.js
import { db } from "./firebase.js";
import {
  ref,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const userPhone = localStorage.getItem("userPhone");
if (!userPhone) {
  alert("আপনি লগ ইন করেননি");
  window.location.href = "index.html";
}

const isAdmin = userPhone === "0712499829"; // এডমিন চেক

const postText = document.getElementById("postText");
const postList = document.getElementById("postList");

window.createPost = function () {
  const text = postText.value.trim();
  if (text === "") return;

  const postRef = ref(db, "posts");
  push(postRef, {
    text: text,
    author: userPhone,
    time: Date.now()
  });

  postText.value = "";
};

// সব পোস্ট লোড করো
const postsRef = ref(db, "posts");
onValue(postsRef, (snapshot) => {
  const posts = snapshot.val();
  postList.innerHTML = "";

  for (const postId in posts) {
    const post = posts[postId];
    const postDiv = document.createElement("div");
    postDiv.style.border = "1px solid #ccc";
    postDiv.style.margin = "10px";
    postDiv.style.padding = "10px";

    const author = post.author === userPhone ? "আপনি" : post.author;

    const postContent = document.createElement("p");
    postContent.innerHTML = `<strong>${author}</strong>: ${post.text}`;
    postDiv.appendChild(postContent);

    // কমেন্ট বক্স
    const commentInput = document.createElement("input");
    commentInput.placeholder = "মতামত লিখুন";
    postDiv.appendChild(commentInput);

    const commentBtn = document.createElement("button");
    commentBtn.textContent = "মতামত পাঠান";
    commentBtn.onclick = () => {
      const commentText = commentInput.value.trim();
      if (commentText === "") return;
      const commentRef = ref(db, `comments/${postId}`);
      push(commentRef, {
        text: commentText,
        author: userPhone,
        time: Date.now()
      });
      commentInput.value = "";
    };
    postDiv.appendChild(commentBtn);

    // কমেন্ট লিস্ট
    const commentList = document.createElement("div");
    commentList.style.marginTop = "10px";
    postDiv.appendChild(commentList);

    const commentRef = ref(db, `comments/${postId}`);
    onValue(commentRef, (snapshot) => {
      const comments = snapshot.val();
      commentList.innerHTML = "";
      for (const commentId in comments) {
        const comment = comments[commentId];
        const commentItem = document.createElement("p");
        commentItem.textContent = `${comment.author}: ${comment.text}`;

        // এডমিন হলে ডিলিট অপশন
        if (isAdmin) {
          const delBtn = document.createElement("button");
          delBtn.textContent = "❌";
          delBtn.onclick = () => {
            remove(ref(db, `comments/${postId}/${commentId}`));
          };
          commentItem.appendChild(delBtn);
        }

        commentList.appendChild(commentItem);
      }
    });

    // এডমিন হলে পোস্ট ডিলিট অপশন
    if (isAdmin) {
      const delPostBtn = document.createElement("button");
      delPostBtn.textContent = "পোস্ট ডিলিট করুন";
      delPostBtn.onclick = () => {
        remove(ref(db, `posts/${postId}`));
        remove(ref(db, `comments/${postId}`));
      };
      postDiv.appendChild(delPostBtn);
    }

    postList.appendChild(postDiv);
  }
});
