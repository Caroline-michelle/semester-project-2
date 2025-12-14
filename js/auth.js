const API = "https://v2.api.noroff.dev";
const KEY = "auction_auth";

export function saveAuth(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAuth() {
  return JSON.parse(localStorage.getItem(KEY));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export async function loginUser(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.message);
  return data.data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.message);
  return data.data;
}

export async function fetchCredits() {
  const auth = getAuth();
  if (!auth) return null;

  const res = await fetch(`${API}/auction/profiles/${auth.name}`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  const data = await res.json();
  auth.credits = data.data.credits;
  saveAuth(auth);
  return auth.credits;
}
