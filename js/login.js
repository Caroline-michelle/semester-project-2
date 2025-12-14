import { loginUser, saveAuth } from "./auth.js";

const form = document.getElementById("loginForm");
const errorEl = document.getElementById("loginError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email.endsWith("@stud.noroff.no")) {
    errorEl.textContent = "Email must end with @stud.noroff.no";
    return;
  }

  try {
    const authData = await loginUser(email, password);
    saveAuth(authData);
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message;
  }
});
