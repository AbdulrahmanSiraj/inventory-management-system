//* using fake server
//^ json-server --watch data/db.json --port 3000 ==> run this command in terminal

// import { loadDashboard } from "./pages/dashboard.page.js";
import { loadProducts } from "./pages/products.js";
import { loadCategories } from "./pages/categories.js";
import { loadSuppliers } from "./pages/suppliers.js";
import { loadReports } from "./pages/reports.js";

const toggle = document.getElementById("sidebarToggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("sidebarOverlay");

toggle?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
});

overlay?.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
});

document.addEventListener("DOMContentLoaded", function () {
  // استرجعي الصفحة المحفوظة
  const savedPage = localStorage.getItem("currentPage") || "Products";
  navigateTo(savedPage);

  document.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      let text = this.textContent.trim();
      navigateTo(text);
    });
  });
});

function navigateTo(text) {
  document.getElementById("pageTitle").textContent = text;

  document.querySelectorAll(".sidebar a").forEach((l) => {
    l.classList.remove("active-content");
  });

  document.querySelectorAll(".sidebar a").forEach((l) => {
    if (l.textContent.trim() === text) l.classList.add("active-content");
  });

  localStorage.setItem("currentPage", text);

  switch (text) {
    case "Products":
      loadProducts();
      break;
    case "Categories":
      loadCategories();
      break;
    case "Suppliers":
      loadSuppliers();
      break;
    case "Reports":
      loadReports();
      break;
  }
}
