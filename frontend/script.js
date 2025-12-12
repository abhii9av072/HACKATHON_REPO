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
      if (!window.google) {
        return alert("Google client not loaded. Try again.");
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "profile email",
        callback: async (response) => {
          try {
            if (!response.access_token) {
              return alert("Google Sign-In failed.");
            }

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
            } else {
              alert("Server did not return a token.");
            }

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

      const data = await res.json();

      document.getElementById("moneySaved").innerText = `₹${data.moneySaved}`;
      document.getElementById("carbonSaved").innerText = `${data.carbonSaved} kg CO₂`;
      document.getElementById("trustMeter").innerText = `${data.trustMeter} / 100`;

    } catch (err) {
      console.error("Metric Load Error:", err);
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
      const data = await res.json();

      const container = document.getElementById("leaderboard-list");
      if (!container) return;

      container.innerHTML = "";

      data.leaderboard.forEach((user, i) => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center";

        div.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="text-xl font-bold">${i + 1}</span>
            <img src="${user.picture}" class="w-10 h-10 rounded-full">
            <div>
              <p class="font-semibold">${user.name}</p>
              <p class="text-sm text-gray-500">${user.carbonSaved} kg CO₂ saved</p>
            </div>
          </div>
        `;

        container.appendChild(div);
      });

    } catch (err) {
      console.error("Leaderboard Error:", err);
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
  // BORROW PAGE
  // ===============================
  async function loadBorrowItems(query = "") {
    try {
      const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      const container = document.getElementById("borrow-items-list");
      if (!container) return;

      container.innerHTML = "";

      data.results.forEach(item => {
        const div = document.createElement("div");
        div.className =
          "bg-white rounded-2xl shadow p-4 hover:shadow-xl transition flex flex-col";

        div.innerHTML = `
          <img src="${item.image}" class="w-full h-40 object-cover rounded-2xl mb-3">
          <h3 class="text-lg font-semibold">${item.name}</h3>
          <button class="mt-3 py-2 bg-green-600 text-white rounded-xl"
            onclick="window.borrowItem('${item._id}')">Borrow</button>
        `;

        container.appendChild(div);
      });
    } catch (err) {
      console.error(err);
    }
  }

  window.loadBorrowItems = loadBorrowItems;
  if (currentPage === "borrow.html") loadBorrowItems();

  // ===============================
  // BORROW ACTION
  // ===============================
  window.borrowItem = async function (itemId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      });

      const data = await res.json();

      if (data.success) {
        alert("Item borrowed!");
        loadBorrowItems();
        loadDashboardMetrics();
      } else {
        alert(data.error || "Borrow failed");
      }

    } catch (err) {
      console.error(err);
    }
  };


  // ===============================
  // LEND PAGE
  // ===============================
  const lendForm = document.getElementById("lend-form");

  if (lendForm) {
    lendForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("item-name").value;
      const category = document.getElementById("item-category").value;
      const desc = document.getElementById("item-desc").value;
      const fileInput = document.getElementById("item-image").files[0];

      let imageData = "";
      if (fileInput) {
        imageData = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(fileInput);
        });
      }

      const res = await fetch(`${API_BASE_URL}/api/lend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          category,
          description: desc,
          image: imageData
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Item added!");
        lendForm.reset();
      } else {
        alert("Failed to add item.");
      }
    });
  }


  // ===============================
  // PROFILE PAGE
  // ===============================
  async function loadProfile() {
    try {
      const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const metricsRes = await fetch(`${API_BASE_URL}/api/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = await userRes.json();
      const metrics = await metricsRes.json();

      document.getElementById("profile-pic").src = user.user.picture;
      document.getElementById("profile-name").innerText = user.user.name;
      document.getElementById("profile-email").innerText = user.user.email;
      document.getElementById("profile-money").innerText = `₹${metrics.moneySaved}`;
      document.getElementById("profile-carbon").innerText = `${metrics.carbonSaved} kg CO₂`;
      document.getElementById("profile-trust").innerText = `${metrics.trustMeter} / 100`;

    } catch (err) {
      console.error(err);
    }
  }

  window.loadProfile = loadProfile;
  if (currentPage === "profile.html") loadProfile();



}); // END DOMContentLoaded



// ===============================
// HELPER: PARSE JWT
// ===============================
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
