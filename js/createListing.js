import { getAuth } from "./auth.js";

const form = document.getElementById("createListingForm");
const errorEl = document.getElementById("createError");

const API_URL = "https://v2.api.noroff.dev/auction/listings";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const auth = getAuth();
  if (!auth?.accessToken) {
    errorEl.textContent = "You must be logged in.";
    return;
  }

  const body = {
    title: document.getElementById("title").value.trim(),
    endsAt: new Date(document.getElementById("endsAt").value).toISOString(),
    description: document.getElementById("description").value.trim(),
  };

  const imageUrl = document.getElementById("imageUrl").value.trim();
  const imageAlt = document.getElementById("imageAlt").value.trim();

  if (imageUrl) {
    body.media = [{ url: imageUrl, alt: imageAlt || "" }];
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.message);

    window.location.href = `listing.html?id=${data.data.id}`;
  } catch (err) {
    errorEl.textContent = err.message;
  }
});
