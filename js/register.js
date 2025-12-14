import { registerUser } from "./auth.js";

const form = document.getElementById("registerForm");
const errorEl = document.getElementById("registerError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (name.length < 3) {
    errorEl.textContent = "Username must be at least 3 characters.";
    return;
  }
  if (!email.endsWith("@stud.noroff.no")) {
    errorEl.textContent = "Email must end with @stud.noroff.no";
    return;
  }
  if (password.length < 8) {
    errorEl.textContent = "Password must be at least 8 characters.";
    return;
  }

  try {
    await registerUser(name, email, password);
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message;
  }
});
