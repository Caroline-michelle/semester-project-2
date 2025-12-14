// js/listingdetails.js

// HTML-containere
const detailsContainer = document.getElementById("listingDetails");
const bidsContainer = document.getElementById("bidsSection");

// Hent id fra URL: listing.html?id=123
const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

if (!listingId) {
  if (detailsContainer) {
    detailsContainer.innerHTML = "<p>No listing id provided.</p>";
  }
} else {
  loadListing(listingId);
}

async function loadListing(id) {
  if (!detailsContainer || !bidsContainer) return;

  detailsContainer.innerHTML = "<p>Loading listing…</p>";
  bidsContainer.innerHTML = "";

  try {
    const url = `https://v2.api.noroff.dev/auction/listings/${id}?_seller=true&_bids=true`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.data) {
      detailsContainer.innerHTML = "<p>Could not load listing.</p>";
      return;
    }

    const listing = data.data;

    renderListingDetails(listing);
    renderBids(listing);
  } catch (error) {
    console.error(error);
    detailsContainer.innerHTML = "<p>Error loading listing.</p>";
  }
}

function renderListingDetails(listing) {
  const imgUrl = listing.media?.[0] || "https://via.placeholder.com/500x350";
  const sellerName = listing.seller?.name || "Unknown seller";
  const endsAt = listing.endsAt
    ? new Date(listing.endsAt).toLocaleString()
    : "Unknown end time";

  // Finn høyeste bud
  let highestBid = 0;
  if (Array.isArray(listing.bids) && listing.bids.length > 0) {
    const sorted = [...listing.bids].sort(
      (a, b) => Number(b.amount) - Number(a.amount)
    );
    highestBid = sorted[0].amount;
  }

  detailsContainer.innerHTML = `
    <div class="listing-image">
      <img src="${imgUrl}" alt="${listing.title}" />
    </div>

    <div class="listing-info">
      <h1>${listing.title}</h1>
      <p class="listing-seller">Seller: <strong>${sellerName}</strong></p>
      <p class="listing-ends">Ends at: <strong>${endsAt}</strong></p>

      <p class="listing-current-bid">
        Current highest bid:
        <span class="badge">${highestBid} NOK</span>
      </p>

      <p class="listing-description">
        ${listing.description || "No description provided."}
      </p>
    </div>
  `;
}

function renderBids(listing) {
  const bids = Array.isArray(listing.bids) ? listing.bids : [];

  bidsContainer.innerHTML = `
    <h2>Bids</h2>
    ${
      bids.length === 0
        ? "<p>No bids yet.</p>"
        : `
          <ul class="bids-list">
            ${bids
              .slice()
              .sort((a, b) => new Date(b.created) - new Date(a.created))
              .reverse()
              .map((bid) => {
                const created = new Date(bid.created).toLocaleString();
                const bidder = bid.bidderName || bid.bidder || "Anonymous";
                return `
                  <li class="bid-item">
                    <span class="bid-amount">${bid.amount} NOK</span>
                    <span class="bid-meta">
                      by ${bidder} • ${created}
                    </span>
                  </li>
                `;
              })
              .join("")}
          </ul>
        `
    }
  `;
}
