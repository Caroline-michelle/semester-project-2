const API_URL =
  "https://v2.api.noroff.dev/auction/listings?_seller=true&_bids=true";

const container = document.getElementById("listingsContainer");
const searchInput = document.getElementById("globalSearch");

const FALLBACK_IMG = "https://via.placeholder.com/600x400?text=No+image";

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function getMediaUrl(media) {
  const first = media?.[0];
  if (!first) return null;
  if (typeof first === "string") return first;
  return first.url || null;
}

function getHighestBid(bids) {
  if (!Array.isArray(bids) || bids.length === 0) return 0;
  return bids.reduce((max, b) => Math.max(max, Number(b.amount || 0)), 0);
}

async function getListings() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();

    const listings = (json?.data ?? []).sort(
      (a, b) => new Date(b.created) - new Date(a.created)
    );

    renderListings(listings);
    return listings;
  } catch (e) {
    console.error(e);
    if (container) container.innerHTML = "<p>Error loading listings.</p>";
    return [];
  }
}

function renderListings(list) {
  if (!container) return;

  if (!list.length) {
    container.innerHTML = "<p>No listings found.</p>";
    return;
  }

  container.innerHTML = list
    .map((item) => {
      const imgUrl = getMediaUrl(item.media) || FALLBACK_IMG;
      const highestBid = getHighestBid(item.bids);

      const title = item.title || "Untitled";
      const description = item.description
        ? truncate(item.description, 90)
        : "No description provided.";

      const endsAt = item.endsAt
        ? new Date(item.endsAt).toLocaleString("no-NO")
        : "—";

      return `
        <article class="listing-card">
          <img
            src="${imgUrl}"
            alt="${title}"
            onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"
          />
          <h2 class="listing-title">${title}</h2>
          <p class="listing-meta">Ends: ${endsAt}</p>
          <p>${description}</p>

          <div class="listing-footer">
            <span class="badge">${highestBid} NOK</span>
            <a class="btn btn-primary" href="listing.html?id=${item.id}">
              View listing
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

function filterListings(query, list) {
  const q = (query || "").trim().toLowerCase();

  if (!q) {
    renderListings(list);
    return;
  }

  const filtered = list.filter((i) =>
    (i.title || "").toLowerCase().includes(q)
  );

  renderListings(filtered);
}

let allListings = [];
getListings().then((l) => {
  allListings = l;
});

if (searchInput) {
  searchInput.addEventListener("input", (e) =>
    filterListings(e.target.value, allListings)
  );
}
