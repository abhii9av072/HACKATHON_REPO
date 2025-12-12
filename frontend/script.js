// ===============================
// CONFIG
// ===============================
const API_BASE_URL = "http://localhost:5500";
let token = localStorage.getItem("borrownest_token");

document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // AUTO REDIRECT IF LOGGED IN
  // ===============================
  if (location.pathname.endsWith("index.html") && token) {
    window.location.href = "dashboard.html";
    return;
  }

  // ===============================
  // PROTECTED PAGES
  // ===============================
  const protectedPages = ["dashboard.html", "borrow.html", "lend.html", "profile.html"];
  const currentPage = location.pathname.split("/").pop();

  if (protectedPages.includes(currentPage) && !token) {
    alert("Please login first!");
    window.location.href = "index.html";
    return;
  }

  // ===============================
  // LOGOUT
  // ===============================
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("borrownest_token");
      localStorage.removeItem("borrownest_user");
      window.location.href = "index.html";
    });
  }

  // ===============================
  // PROFILE POPUP
  // ===============================
  const profileBtn = document.getElementById("profile-btn");
  const profilePopup = document.getElementById("profile-popup");

  if (profileBtn && profilePopup) {
    profileBtn.addEventListener("click", () => {
      profilePopup.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !profilePopup.contains(e.target)) {
        profilePopup.classList.add("hidden");
      }
    });
  }

  // ===============================
  // GOOGLE SIGN-IN
  // ===============================
  const GOOGLE_CLIENT_ID = "422197501980-9d8fggst2moleo912sibvkqbd69ub3hf.apps.googleusercontent.com";
  const googleBtn = document.getElementById("google-signin");

  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      if (!window.google) return alert("Google client not loaded. Try again.");

      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "profile email",
        callback: async (response) => {
          try {
            if (!response.access_token) return alert("Google Sign-In failed.");

            const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });

            const user = await userRes.json();

            const backendRes = await fetch(`${API_BASE_URL}/api/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                picture: user.picture,
                googleId: user.id
              })
            });

            const backendData = await backendRes.json();

            if (backendData.token) {
              localStorage.setItem("borrownest_token", backendData.token);
              localStorage.setItem("borrownest_user", JSON.stringify(backendData.user));
              window.location.href = "dashboard.html";
            } else alert("Server did not return a token.");

          } catch (err) {
            console.error(err);
            alert("Google Login Error. Check Console.");
          }
        }
      });

      client.requestAccessToken({ prompt: "" });
    });
  }

  // ===============================
  // DASHBOARD METRICS
  // ===============================
  async function loadDashboardMetrics() {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to load metrics");

      const data = await res.json();

      document.getElementById("moneySaved").innerText = `₹${data.moneySaved || 0}`;
      document.getElementById("carbonSaved").innerText = `${data.carbonSaved || 0} kg CO₂`;
      if (document.getElementById("trustMeter")) {
        document.getElementById("trustMeter").innerText = `${data.trustMeter || 0} / 100`;
      }

    } catch (err) {
      console.error("Metric Load Error:", err);
      document.getElementById("moneySaved").innerText = `₹0`;
      document.getElementById("carbonSaved").innerText = `0 kg CO₂`;
      if (document.getElementById("trustMeter")) {
        document.getElementById("trustMeter").innerText = `0 / 100`;
      }
    }
  }

  window.loadDashboardMetrics = loadDashboardMetrics;
  if (currentPage === "dashboard.html") loadDashboardMetrics();

  // ===============================
  // LEADERBOARD (CARBON BASED)
  // ===============================
  async function loadLeaderboard() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaderboard`);

      if (!res.ok) throw new Error("Failed to load leaderboard");

      const data = await res.json();
      const container = document.getElementById("leaderboard-list");
      if (!container) return;

      container.innerHTML = "";

      if (data && Array.isArray(data.leaderboard)) {
        data.leaderboard.forEach((user, i) => {
          const div = document.createElement("div");
          div.className = "bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center";

          div.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold">${i + 1}</span>
              <img src="${user.picture}" class="w-10 h-10 rounded-full">
              <div>
                <p class="font-semibold">${user.name}</p>
                <p class="text-sm text-gray-500">${user.carbonSaved || 0} kg CO₂ saved</p>
              </div>
            </div>
          `;
          container.appendChild(div);
        });
      } else {
        container.innerHTML = `<p class="text-gray-500">No leaderboard data available.</p>`;
      }

    } catch (err) {
      console.error("Leaderboard Error:", err);
      const container = document.getElementById("leaderboard-list");
      if (container) container.innerHTML = `<p class="text-gray-500">Failed to load leaderboard.</p>`;
    }
  }

  window.loadLeaderboard = loadLeaderboard;
  if (currentPage === "dashboard.html") loadLeaderboard();

  // ===============================
  // 18-TIP POPUP ONCE PER LOGIN
  // ===============================
  function showTipsPopup() {
    if (localStorage.getItem("tips_shown")) return;

    const tips = [
      "Share items to save money.",
      "Borrow instead of buying.",
      "Increase your Trust Score by lending.",
      "Upload clear item photos.",
      "Give accurate descriptions.",
      "Return items on time.",
      "Check item availability fast.",
      "Track your carbon savings.",
      "Use filters to find items faster.",
      "Enable notifications for updates.",
      "Add your friends to grow network.",
      "Earn trust points by lending.",
      "Review your borrowed history.",
      "Use search bar for categories.",
      "Choose items with shorter distance.",
      "Keep your profile updated.",
      "Respond fast to borrow requests.",
      "Help others reduce carbon use."
    ];

    const popup = document.createElement("div");
    popup.className =
      "fixed bottom-4 right-4 bg-white shadow-2xl rounded-xl p-4 w-72 z-50 border";

    popup.innerHTML = `
      <h3 class="font-bold mb-2">Quick Tips</h3>
      <ul class="text-sm leading-5 max-h-60 overflow-y-auto">
        ${tips.map(t => `<li>• ${t}</li>`).join("")}
      </ul>
      <button id="close-tips" class="mt-3 w-full bg-green-600 text-white py-2 rounded-lg">
        Got it
      </button>
    `;

    document.body.appendChild(popup);
    document.getElementById("close-tips").onclick = () => popup.remove();

    localStorage.setItem("tips_shown", "1");
  }

  if (currentPage === "dashboard.html") showTipsPopup();

  // ===============================
  // REST OF FUNCTIONS REMAIN SAME
  // (borrow, lend, requests, profile)...
  // ===============================

}); // END DOMContentLoaded

// ===============================
// HELPER: PARSE JWT
// ===============================
function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}
