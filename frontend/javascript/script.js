// ==============================
// CONFIG
// ==============================
const API_BASE_URL = "https://your-backend-url.com";   // change this

// Cache DOM
const searchInput = document.querySelector("input");
const searchBtn = document.getElementById("search-btn");
const googleBtn = document.getElementById("google-signin");

// Create suggestion container
let suggestionBox = document.createElement("div");
suggestionBox.className =
  "absolute bg-white border border-gray-300 rounded-lg mt-1 w-full shadow-lg z-50 hidden";
searchInput.parentElement.appendChild(suggestionBox);

// ==============================
// SEARCH FUNCTIONALITY
// ==============================
async function searchItems(query) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/items?query=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!data || data.length === 0) {
            alert("No items found near you.");
            return;
        }

        alert(`Found ${data.length} items! (Display them on the page UI)`);
        // TODO: Here you can dynamically insert items into the UI.

    } catch (err) {
        console.error("Search error:", err);
        alert("Something went wrong while searching.");
    }
}

searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) {
        alert("Please enter a search term.");
        return;
    }
    searchItems(query);
});

// ==============================
// SEARCH SUGGESTIONS
// ==============================
let suggestionTimeout;

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();

    if (!query) {
        suggestionBox.classList.add("hidden");
        return;
    }

    clearTimeout(suggestionTimeout);
    suggestionTimeout = setTimeout(() => fetchSuggestions(query), 300);
});

async function fetchSuggestions(query) {
    try {
        const res = await fetch(
            `${API_BASE_URL}/api/items/suggestions?query=${encodeURIComponent(query)}`
        );
        const suggestions = await res.json();

        renderSuggestions(suggestions);
    } catch (err) {
        console.error("Suggestion error:", err);
    }
}

function renderSuggestions(suggestions) {
    suggestionBox.innerHTML = "";

    if (!suggestions || suggestions.length === 0) {
        suggestionBox.classList.add("hidden");
        return;
    }

    suggestionBox.classList.remove("hidden");

    suggestions.forEach(item => {
        const div = document.createElement("div");
        div.className =
            "px-4 py-2 cursor-pointer hover:bg-gray-100 transition rounded-lg";
        div.textContent = item.name;

        div.addEventListener("click", () => {
            searchInput.value = item.name;
            suggestionBox.classList.add("hidden");
            searchItems(item.name); // Auto search on click
        });

        suggestionBox.appendChild(div);
    });
}

// Hide dropdown when clicked outside
document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target)) {
        suggestionBox.classList.add("hidden");
    }
});

// ==============================
// GOOGLE SIGN-IN (REAL IMPLEMENTATION)
// ==============================
googleBtn.addEventListener("click", async () => {

    try {
        // Open Google OAuth page
        window.location.href = `${API_BASE_URL}/api/auth/google`;

    } catch (err) {
        console.log("Google login error:", err);
        alert("Google login failed.");
    }
});

// ==============================
// HANDLE REDIRECT AFTER GOOGLE LOGIN
// (This should run when user returns from Google OAuth redirect URL)
// ==============================
function detectGoogleRedirect() {
    const params = new URLSearchParams(window.location.search);

    if (params.has("token")) {
        const token = params.get("token");

        // Store the login token
        localStorage.setItem("borrownest_token", token);

        // Redirect to dashboard
        window.location.href = "/dashboard.html";
    }
}

// Run on page load
detectGoogleRedirect();
