import { getAuth, clearAuth, fetchCredits } from "./auth.js";

export async function loadNavbar() {
  const header = document.getElementById("siteHeader");
  const auth = getAuth();
  const loggedIn = !!auth?.accessToken;

  let credits = null;
  if (loggedIn) {
    try {
      credits = await fetchCredits();
    } catch {}
  }

  header.innerHTML = `
    <nav class="navbar">
      <a class="logo" href="index.html">Auction House</a>

      <div class="nav-middle">
        <input id="globalSearch" placeholder="Search listings..." />
      </div>

     <div class="nav-right">
  <a href="index.html">Listings</a>

  ${loggedIn ? `<a href="create.html">Create</a>` : ""}

  ${!loggedIn ? `<a href="login.html">Login</a>` : ""}
  ${!loggedIn ? `<a href="register.html">Register</a>` : ""}

  ${loggedIn ? `<span class="badge">${credits ?? "—"} credits</span>` : ""}

  ${loggedIn ? `<button id="logoutBtn" class="nav-logout">Logout</button>` : ""}
</div>
    </nav>
  `;

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    clearAuth();
    location.href = "index.html";
  });
}

loadNavbar();
