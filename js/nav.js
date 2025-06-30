// js/nav.js
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
      ${userName ? `<div style="position: fixed; top: 10px; right: 10px;">স্বাগতম, <strong>${userName}</strong></div>` : ""}
    `;
  }
});
