document.addEventListener("DOMContentLoaded", () => {
  const navDiv = document.getElementById("navButtons");
  const userName = localStorage.getItem("userName");

  if (navDiv) {
    navDiv.innerHTML = `
      <div style="position: fixed; top: 10px; left: 10px; display: flex; gap: 10px;">
        <button onclick="history.back()">◀️ Back</button>
        <button onclick="history.forward()">▶️ Forward</button>
        <button onclick="location.reload()">🔄 Reload</button>
      </div>
      ${
        userName
          ? `<div style="position: fixed; top: 10px; right: 10px; display: flex; align-items: center; gap: 10px;">
              <span>স্বাগতম, <strong>${userName}</strong></span>
              <button onclick="logout()" style="background:red;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">🚪 লগ আউট</button>
            </div>`
          : ""
      }
    `;
  }
});

// ✅ লগ আউট ফাংশন
window.logout = function () {
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userName");
  localStorage.removeItem("isAdmin");
  window.location.href = "index.html";
};
