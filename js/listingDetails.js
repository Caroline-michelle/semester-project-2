import { getAuth, getAuthHeaders, fetchCredits } from "./auth.js";

const detailsContainer = document.getElementById("listingDetails");
const bidSection = document.getElementById("bidSection");
const bidsContainer = document.getElementById("bidsSection");

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

const FALLBACK_IMG = "https://picsum.photos/seed/noimage/1000/700";

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

if (!listingId) {
  if (detailsContainer)
    detailsContainer.innerHTML = "<p>No listing id provided.</p>";
} else {
  loadListing(listingId);
}

async function loadListing(id) {
  if (detailsContainer) detailsContainer.innerHTML = "<p>Loading…</p>";
  if (bidSection) bidSection.innerHTML = "";
  if (bidsContainer) bidsContainer.innerHTML = "";

  try {
    const url = `https://v2.api.noroff.dev/auction/listings/${id}?_seller=true&_bids=true`;
    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.errors?.[0]?.message || "Could not load listing.");
    }

    const listing = json.data;

    renderDetails(listing);
    renderBidUI(listing);
    renderBids(listing.bids || []);
  } catch (e) {
    console.error(e);
    if (detailsContainer) detailsContainer.innerHTML = `<p>${e.message}</p>`;
  }
}

function renderDetails(listing) {
  const title = listing.title || "Untitled";
  const imgUrl = getMediaUrl(listing.media) || FALLBACK_IMG;

  const sellerName = listing.seller?.name || "Unknown";
  const endsAt = listing.endsAt
    ? new Date(listing.endsAt).toLocaleString("no-NO")
    : "—";
  const highestBid = getHighestBid(listing.bids);

  if (!detailsContainer) return;

  detailsContainer.innerHTML = `
    <div class="listing-image">
      <img
        src="${imgUrl}"
        alt="${title}"
        onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"
      />
    </div>

    <div class="listing-info">
      <h1>${title}</h1>
      <p class="listing-seller">Seller: <strong>${sellerName}</strong></p>
      <p class="listing-ends">Ends at: <strong>${endsAt}</strong></p>
      <p class="listing-current-bid">
        Current highest bid: <span class="badge">${highestBid} NOK</span>
      </p>
      <p class="listing-description">${
        listing.description || "No description provided."
      }</p>
    </div>
  `;
}

function renderBidUI(listing) {
  if (!bidSection) return;

  const auth = getAuth();
  const loggedIn = !!auth?.accessToken;
  const isSeller = auth?.name && listing.seller?.name === auth.name;
  const isEnded = listing.endsAt
    ? new Date(listing.endsAt).getTime() <= Date.now()
    : false;

  if (!loggedIn) {
    bidSection.innerHTML = `
      <div class="bid-card">
        <h2>Place a bid</h2>
        <p>You must be logged in to bid.</p>
        <a class="btn btn-primary" href="login.html">Log in</a>
      </div>
    `;
    return;
  }

  if (isSeller) {
    bidSection.innerHTML = `
      <div class="bid-card">
        <h2>Place a bid</h2>
        <p>You can’t bid on your own listing.</p>
      </div>
    `;
    return;
  }

  if (isEnded) {
    bidSection.innerHTML = `
      <div class="bid-card">
        <h2>Place a bid</h2>
        <p>This auction has ended.</p>
      </div>
    `;
    return;
  }

  const currentHighest = getHighestBid(listing.bids);

  bidSection.innerHTML = `
    <div class="bid-card">
      <h2>Place a bid</h2>
      <p class="bid-hint">Current highest bid: <strong>${currentHighest} NOK</strong></p>

      <form id="bidForm" class="bid-form" novalidate>
        <div class="form-group">
          <label for="bidAmount">Your bid (NOK)</label>
          <input id="bidAmount" type="number" min="1" step="1" required placeholder="e.g. ${
            currentHighest + 10
          }" />
        </div>

        <p id="bidError" class="form-error" aria-live="polite"></p>
        <button class="btn btn-primary" type="submit">Place bid</button>
      </form>
    </div>
  `;

  const form = document.getElementById("bidForm");
  const errorEl = document.getElementById("bidError");
  const amountInput = document.getElementById("bidAmount");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const amount = Number(amountInput.value);

    if (!Number.isFinite(amount) || amount <= 0) {
      errorEl.textContent = "Please enter a valid bid amount.";
      return;
    }

    if (amount <= currentHighest) {
      errorEl.textContent = `Your bid must be higher than ${currentHighest} NOK.`;
      return;
    }

    try {
      const headers = getAuthHeaders();

      const res = await fetch(
        `https://v2.api.noroff.dev/auction/listings/${listing.id}/bids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({ amount }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.errors?.[0]?.message || "Could not place bid.");
      }

      try {
        await fetchCredits();
      } catch (_) {}
      await loadListing(listing.id);
    } catch (err) {
      console.error(err);
      errorEl.textContent = err.message;
    }
  });
}

function renderBids(bids) {
  if (!bidsContainer) return;

  const sorted = bids
    .slice()
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  bidsContainer.innerHTML = `
    <h2>Bids</h2>
    ${
      !sorted.length
        ? "<p>No bids yet.</p>"
        : `
      <ul class="bids-list">
        ${sorted
          .map((bid) => {
            const bidder = bid.bidder?.name || "Unknown";
            const created = bid.created
              ? new Date(bid.created).toLocaleString("no-NO")
              : "";
            return `
            <li class="bid-item">
              <span class="bid-amount">${bid.amount} NOK</span>
              <span class="bid-meta">by ${bidder} • ${created}</span>
            </li>
          `;
          })
          .join("")}
      </ul>
    `
    }
  `;
}
