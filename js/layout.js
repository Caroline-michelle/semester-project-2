import { getAuth, clearAuth, fetchCredits } from "./auth.js";

export async function loadNavbar() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const auth = getAuth();
  const loggedIn = !!auth?.accessToken;

  let credits = auth?.credits ?? null;
  if (loggedIn) {
    try {
      credits = await fetchCredits();
    } catch (e) {
      console.warn(e);
    }
  }

  header.innerHTML = `
    <nav class="navbar">
      <a class="logo" href="index.html">Auction House</a>

      <div class="nav-middle">
        <div class="search-wrapper">
          <input id="globalSearch" type="search" placeholder="Search listings..." />
        </div>
      </div>

      <div class="nav-right">
        <a href="index.html">Listings</a>

        ${loggedIn ? `<a href="create.html">Create</a>` : ""}
        ${loggedIn ? `<a href="profile.html">Profile</a>` : ""}

        ${!loggedIn ? `<a href="login.html">Login</a>` : ""}
        ${!loggedIn ? `<a href="register.html">Register</a>` : ""}

        ${
          loggedIn ? `<span class="badge">${credits ?? "—"} credits</span>` : ""
        }
         

        ${
          loggedIn
            ? `<button id="logoutBtn" class="nav-logout" type="button">Logout</button>`
            : ""
        }
      </div>
    </nav>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      window.location.href = "index.html";
    });
  }
}

loadNavbar();
