import { getAuthHeaders } from "./auth.js";

const form = document.getElementById("createListingForm");
const errorEl = document.getElementById("createError");

const API_URL = "https://v2.api.noroff.dev/auction/listings";

function toIsoFromDatetimeLocal(value) {
  return new Date(value).toISOString();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  let headers;
  try {
    headers = getAuthHeaders();
  } catch (err) {
    errorEl.textContent = err.message;
    return;
  }

  const title = document.getElementById("title").value.trim();
  const endsAtValue = document.getElementById("endsAt").value;
  const description = document.getElementById("description").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();
  const imageAlt = document.getElementById("imageAlt").value.trim();

  if (title.length < 3) {
    errorEl.textContent = "Title must be at least 3 characters.";
    return;
  }
  if (!endsAtValue) {
    errorEl.textContent = "Please choose an end date/time.";
    return;
  }

  const body = { title, endsAt: toIsoFromDatetimeLocal(endsAtValue) };
  if (description) body.description = description;
  if (imageUrl) body.media = [{ url: imageUrl, alt: imageAlt || "" }];

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(
        data?.errors?.[0]?.message || "Could not create listing."
      );

    window.location.href = `listing.html?id=${data.data.id}`;
  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message;
  }
});
