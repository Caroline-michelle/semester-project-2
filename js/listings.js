// js/listings.js

const API_URL =
  "https://v2.api.noroff.dev/auction/listings?_seller=true&_bids=true";

const container = document.getElementById("listingsContainer");
const searchInput = document.getElementById("globalSearch");

async function getListings() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!data || !data.data) {
      container.innerHTML = "<p>Could not load listings.</p>";
      return [];
    }

    const listings = data.data.sort(
      (a, b) => new Date(b.created) - new Date(a.created)
    );

    renderListings(listings);
    return listings;
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Error loading listings.</p>";
    return [];
  }
}

function renderListings(list) {
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<p>No listings found.</p>`;
    return;
  }

  container.innerHTML = list
    .map((item) => {
      const img = item.media?.[0] || "https://via.placeholder.com/400x300";
      let highestBid = 0;

      if (Array.isArray(item.bids) && item.bids.length > 0) {
        const sorted = [...item.bids].sort(
          (a, b) => Number(b.amount) - Number(a.amount)
        );
        highestBid = sorted[0].amount;
      }

      return `
        <article class="listing-card">
          <img src="${img}" alt="${item.title}" />
          <h2 class="listing-title">${item.title}</h2>
          <p class="listing-meta">Ends: ${new Date(
            item.endsAt
          ).toLocaleString()}</p>
          <p>${item.description || ""}</p>
          <div class="listing-footer">
            <span class="badge">${highestBid} NOK</span>
            <a class="btn btn-primary" href="listing.html?id=${
              item.id
            }">View listing</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function filterListings(query, list) {
  const q = query.toLowerCase();
  const filtered = list.filter((item) => item.title.toLowerCase().includes(q));
  renderListings(filtered);
}

let allListings = [];

getListings().then((list) => {
  allListings = list;
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    filterListings(e.target.value, allListings);
  });
}
