import { loginUser, saveAuth } from "./auth.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorElement = document.getElementById("loginError");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorElement.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email.endsWith("@stud.noroff.no")) {
      errorElement.textContent =
        "Email must be a valid Noroff student email (@stud.noroff.no).";
      return;
    }

    if (!password) {
      errorElement.textContent = "Please enter your password.";
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Logging in...";
    }

    try {
      const authData = await loginUser(email, password);

      saveAuth(authData);

      window.location.href = "index.html";
    } catch (error) {
      console.error(error);
      errorElement.textContent = error.message;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Log in";
      }
    }
  });
}
