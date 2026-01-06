import { signup, login, logout, onAuthChange } from "./services/authService.js";
import { auth } from "./config/firebase.js";
import { saveUserProfile, getUserProfile } from "./services/userService.js";

onAuthChange(async (user) => {
  if (!user) return;

  const profile = await getUserProfile(user.uid);

  if (profile) {
    window.location.href = "app.html";
  } else {
    openModal(createAccountModal);
  }
});


const overlay = document.getElementById("overlay");
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const createAccountModal = document.getElementById("create-account-modal");
const openLoginBtn = document.getElementById("open-login");
const openSignupBtn = document.getElementById("open-signup");
const closeButtons = document.querySelectorAll(".close-btn");

function hideAllModals() {
  loginModal.classList.add("hidden");
  signupModal.classList.add("hidden");
  createAccountModal.classList.add("hidden");
}

function openModal(modal) {
  hideAllModals();
  overlay.classList.add("active");
  modal.classList.remove("hidden");
}

function closeOverlay() {
  hideAllModals();
  overlay.classList.remove("active");
}

openLoginBtn.addEventListener("click", () => {
  openModal(loginModal);
});

openSignupBtn.addEventListener("click", () => {
  openModal(signupModal);
});

closeButtons.forEach((btn) => {
  btn.addEventListener("click", closeOverlay);
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    closeOverlay();
  }
});

const loginForm = loginModal.querySelector("form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector('input[type="email"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  try {
    await login(email, password);
  } catch (err) {
    alert(err.message);
  }
});

const signupForm = signupModal.querySelector("form");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = signupForm.querySelector('input[type="email"]').value;
  const password = signupForm.querySelector('input[type="password"]').value;

  try {
    const result = await signup(email, password);
  } catch (err) {
    alert(err.message);
  }
});

const createAccountForm = createAccountModal.querySelector("form");

createAccountForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = createAccountForm.querySelector('input[type="text"]').value;
  const user = auth.currentUser;

  if (!user) return;

  try {
    await saveUserProfile(user.uid, name, user.email);
    window.location.href = "app.html";
  } catch (err) {
    alert(err.message);
  }
});
