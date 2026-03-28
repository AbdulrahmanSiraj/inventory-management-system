import { loadProducts } from "./pages/products.js";
import { loadCategories } from "./pages/categories.js";
import { loadSuppliers } from "./pages/suppliers.js";
import { loadReports } from "./pages/reports.js";
import { loadOrders } from "./pages/orders.js";
import { loadActivityLog } from "./pages/activity.js";
import { loadDashboard } from "./pages/dashboard.js";

document.addEventListener("DOMContentLoaded", function () {
  const savedPage = localStorage.getItem("currentPage") || "Products";
  navigateTo(savedPage);

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", function () {
      const text = this.dataset.page;
      if (!text) return;
      navigateTo(text);
    });
  });
});

function navigateTo(text) {
  document.getElementById("pageTitle").textContent = text;

  document.querySelectorAll(".nav-item").forEach((l) => {
    l.classList.remove("active-content");
  });

  document.querySelectorAll(".nav-item").forEach((l) => {
    if (l.dataset.page === text) l.classList.add("active-content");
  });

  localStorage.setItem("currentPage", text);

  switch (text) {
    case "Dashboard":
      loadDashboard();
      break;
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
    case "Purchase Orders":
      loadOrders();
      break;
    case "Activity Log":
      loadActivityLog();
      break;
  }
}
