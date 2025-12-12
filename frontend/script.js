// ===============================
// CONFIG
// ===============================
const API_BASE_URL = "http://localhost:5500";
let token = localStorage.getItem("borrownest_token");

document.addEventListener("DOMContentLoaded", () => {

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
    profileBtn.addEventListener("click", () => profilePopup.classList.toggle("hidden"));
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !profilePopup.contains(e.target)) {
        profilePopup.classList.add("hidden");
      }
    });
  }

  // ===============================
  // HELPER: PARSE JWT
  // ===============================
  window.parseJwt = function(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
  }

});

// ===============================
// LEND ITEMS
// ===============================
window.loadLentItems = async function() {
  if (!token) return;

  const container = document.getElementById("lent-items-list");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/items/mylent`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    container.innerHTML = "";
    if (data && Array.isArray(data.items) && data.items.length) {
      data.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 rounded-2xl shadow flex flex-col gap-2";

        div.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="rounded-xl w-full h-40 object-cover">
          <h3 class="font-bold text-lg text-darkgreen">${item.name}</h3>
          <p class="text-gray-600 text-sm">${item.category}</p>
          <p class="text-gray-700 text-sm">${item.description}</p>
        `;
        container.appendChild(div);
      });
    } else {
      container.innerHTML = `<p class="text-gray-500 text-center">You haven't lent any items yet.</p>`;
    }
  } catch (err) {
    console.error("Failed to load lent items:", err);
    container.innerHTML = `<p class="text-gray-500 text-center">Failed to load lent items.</p>`;
  }
};

// ===============================
// BORROW ITEMS
// ===============================
window.loadBorrowItems = async function() {
  if (!token) return;

  const container = document.getElementById("borrow-items-list");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    container.innerHTML = "";
    if (data && Array.isArray(data.items) && data.items.length) {
      data.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 rounded-2xl shadow flex flex-col gap-2";

        div.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="rounded-xl w-full h-40 object-cover">
          <h3 class="font-bold text-lg text-darkgreen">${item.name}</h3>
          <p class="text-gray-600 text-sm">${item.category}</p>
          <p class="text-gray-700 text-sm">${item.description}</p>
          <button class="mt-2 bg-limegreen text-white py-2 rounded-full hover:bg-accentgreen transition">
            Request Borrow
          </button>
        `;
        container.appendChild(div);
      });
    } else {
      container.innerHTML = `<p class="text-gray-500 text-center">No items available to borrow.</p>`;
    }
  } catch (err) {
    console.error("Failed to load borrow items:", err);
    container.innerHTML = `<p class="text-gray-500 text-center">Failed to load items.</p>`;
  }
};
