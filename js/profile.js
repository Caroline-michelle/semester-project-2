import { getAuth, getAuthHeaders } from "./auth.js";

const API = "https://v2.api.noroff.dev";

const nameEl = document.getElementById("profileName");
const bioEl = document.getElementById("profileBio");
const creditsEl = document.getElementById("profileCredits");
const avatarEl = document.getElementById("profileAvatar");
const bannerEl = document.getElementById("profileBanner");

const form = document.getElementById("profileForm");
const errorEl = document.getElementById("profileError");

const bioInput = document.getElementById("bio");
const avatarInput = document.getElementById("avatarUrl");
const bannerInput = document.getElementById("bannerUrl");

const myListingsEl = document.getElementById("myListings");
const myWinsEl = document.getElementById("myWins");

const FALLBACK_IMG = "https://picsum.photos/seed/noimage/600/400";

function getMediaUrl(media) {
  const first = media?.[0];
  if (!first) return null;
  if (typeof first === "string") return first;
  return first.url || null;
}

const auth = getAuth();
if (!auth?.accessToken || !auth?.name) {
  window.location.href = "login.html";
}

const profileUrl = `${API}/auction/profiles/${auth.name}?_listings=true&_wins=true`;

init();

async function init() {
  await loadProfile();
}

async function loadProfile() {
  try {
    const headers = getAuthHeaders();

    const res = await fetch(profileUrl, { headers });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.errors?.[0]?.message || "Could not load profile.");
    }

    const profile = json.data;

    nameEl.textContent = profile.name;
    bioEl.textContent = profile.bio || "No bio yet.";
    creditsEl.textContent = profile.credits ?? "—";

    if (profile.avatar?.url) {
      avatarEl.src = profile.avatar.url;
    } else {
      avatarEl.src = FALLBACK_IMG;
    }

    if (profile.banner?.url) {
      bannerEl.style.backgroundImage = `url('${profile.banner.url}')`;
    } else {
      bannerEl.style.backgroundImage = "";
    }

    bioInput.value = profile.bio || "";
    avatarInput.value = profile.avatar?.url || "";
    bannerInput.value = profile.banner?.url || "";

    renderCards(myListingsEl, profile.listings || [], "No listings yet.");
    renderCards(myWinsEl, profile.wins || [], "No wins yet.");
  } catch (err) {
    console.error(err);
    if (errorEl) errorEl.textContent = err.message;
  }
}

function renderCards(container, items, emptyText) {
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<p>${emptyText}</p>`;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const img = getMediaUrl(item.media) || FALLBACK_IMG;
      const ends = item.endsAt
        ? new Date(item.endsAt).toLocaleString("no-NO")
        : "—";

      return `
        <article class="listing-card">
          <img
            src="${img}"
            alt="${item.title || "Listing image"}"
            onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"
          />
          <h3 class="listing-title">${item.title || "Untitled"}</h3>
          <p class="listing-meta">Ends: ${ends}</p>
          <div class="listing-footer">
            <a class="btn btn-primary" href="listing.html?id=${
              item.id
            }">View listing</a>
          </div>
        </article>
      `;
    })
    .join("");
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.textContent = "";

    const bio = bioInput.value.trim();
    const avatarUrl = avatarInput.value.trim();
    const bannerUrl = bannerInput.value.trim();

    const body = { bio };

    if (avatarUrl) {
      body.avatar = { url: avatarUrl, alt: "User avatar" };
    }

    if (bannerUrl) {
      body.banner = { url: bannerUrl, alt: "User banner" };
    }

    try {
      const headers = getAuthHeaders();

      const res = await fetch(`${API}/auction/profiles/${auth.name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json?.errors?.[0]?.message || "Could not update profile."
        );
      }

      await loadProfile();
    } catch (err) {
      console.error(err);
      if (errorEl) errorEl.textContent = err.message;
    }
  });
}
