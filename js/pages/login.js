import { fetchData, postData } from "../services/api.js";

const STORAGE_KEY = "currentUser";

//* Initialize the login page and redirect already authenticated users
export async function initLogin() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    window.location.replace("./index.html");
    return;
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
}

//* Handle login form submission and validate user credentials
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }

  try {
    const users = await fetchData("users");

    if (!Array.isArray(users) || users.length === 0) {
      showError(
        "Unable to reach the login service. Start JSON Server on port 3000.",
      );
      return;
    }

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase()
        && item.password === password,
    );

    if (!user) {
      showError("Invalid email or password.");
      return;
    }

    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));

    try {
      await postData("activityLog", {
        action:'LOG_IN',
        details: `${currentUser?.name || "Unknown"} logged in`,
        user: currentUser?.name || "Unknown",
        timestamp: new Date().toLocaleString(),
        createdAt: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error("Activity log error:", error);
    }

    window.location.replace("./index.html");
  } catch (error) {
    console.error("Login error:", error);
    showError("Login failed. Please try again.");
  }
}

//* Display an error message on the login form
function showError(message) {
  const errorDiv = document.getElementById("loginError");
  if (!errorDiv) return;

  errorDiv.textContent = message;
  errorDiv.classList.remove("d-none");
}

//* Read the currently logged-in user from local storage
export function getCurrentUser() {
  try {
    const currentUser = localStorage.getItem(STORAGE_KEY);
    return currentUser ? JSON.parse(currentUser) : null;
  } catch (error) {
    console.error("Unable to read current user:", error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

//* Render the current user name and role in the layout
export function renderCurrentUser(user = getCurrentUser()) {
  if (!user) return null;

  const nameElement = document.getElementById("userName");
  const roleElement = document.getElementById("userRole");

  if (nameElement) {
    nameElement.textContent = user.name;
  }

  if (roleElement) {
    roleElement.textContent = `${user.role} account`;
  }

  return user;
}

//* Protect private pages by redirecting unauthenticated users
export function checkAuth() {
  const user = getCurrentUser();

  if (!user) {
    const isLoginPage = window.location.pathname.endsWith("login.html");
    if (!isLoginPage) {
      window.location.replace("./login.html");
    }
    return null;
  }

  renderCurrentUser(user);
  return user;
}

//* Attach the logout action to the logout button
export function initLogoutButton() {
  const logoutButton = document.getElementById("logoutBtn");
  if (!logoutButton) return;

  logoutButton.addEventListener("click", logout);
}

//* Log the user out, save the activity, and return to the login page
export async function logout() {
  const currentUser = getCurrentUser();

  try {
    await postData("activityLog", {
      action:'LOG_OUT',
      details: `${currentUser?.name || "Unknown"} logged out`,
      user: currentUser?.name || "Unknown",
      timestamp: new Date().toLocaleString(),
      createdAt: new Date().toLocaleString(),
    });
  } catch (error) {
    console.error("Logout activity log error:", error);
  }

  localStorage.removeItem(STORAGE_KEY);
  window.location.replace("./login.html");
}

//* Run login initialization when the login page loads
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("login.html")) {
    initLogin();
  }
});
