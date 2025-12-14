const API = "https://v2.api.noroff.dev";
const AUTH_KEY = "auction_auth";
const APIKEY_KEY = "noroff_api_key";

export function saveAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function getAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function getApiKey() {
  return localStorage.getItem(APIKEY_KEY);
}

export function getAuthHeaders() {
  const auth = getAuth();
  const apiKey = getApiKey();

  if (!auth?.accessToken)
    throw new Error("Not logged in (missing accessToken).");
  if (!apiKey)
    throw new Error("Missing API key. Set localStorage 'noroff_api_key'.");

  return {
    Authorization: `Bearer ${auth.accessToken}`,
    "X-Noroff-API-Key": apiKey,
  };
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.errors?.[0]?.message || data?.message || "Registration failed.";
    throw new Error(msg);
  }
  return data.data;
}

export async function loginUser(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (!res.ok) {
    const msg = data?.errors?.[0]?.message || data?.message || "Login failed.";
    throw new Error(msg);
  }
  return data.data;
}

export async function fetchCredits() {
  const auth = getAuth();
  if (!auth?.name) return null;

  const headers = getAuthHeaders();
  const res = await fetch(`${API}/auction/profiles/${auth.name}`, { headers });
  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.errors?.[0]?.message || data?.message || "Could not load profile.";
    throw new Error(msg);
  }

  const credits = data.data.credits;
  saveAuth({ ...auth, credits });
  return credits;
}
