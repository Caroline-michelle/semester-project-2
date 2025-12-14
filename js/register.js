import { registerUser } from "./auth.js";

const form = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorElement = document.getElementById("registerError");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorElement.textContent = "";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (name.length < 3) {
      errorElement.textContent = "Username must be at least 3 characters.";
      return;
    }

    if (!email.endsWith("@stud.noroff.no")) {
      errorElement.textContent = "Email must end with @stud.noroff.no.";
      return;
    }

    if (password.length < 8) {
      errorElement.textContent = "Password must be at least 8 characters.";
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Creating account...";
    }

    try {
      await registerUser(name, email, password);

      window.location.href = "login.html";
    } catch (error) {
      console.error(error);
      errorElement.textContent = error.message;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Create account";
      }
    }
  });
}
