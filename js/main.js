//* using fake server
//^ json-server --watch data/db.json --port 3000 ==> run this command in terminal

// import { loadDashboard } from "./pages/dashboard.page.js";
import { loadProducts } from "./pages/products.js";
import { loadCategories } from "./pages/categories.js";
import { loadSuppliers } from "./pages/suppliers.js";
import { loadReports } from "./pages/reports.js";


document.addEventListener("DOMContentLoaded", function () {
  //   loadDashboard();

  document.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      let text = this.textContent.trim();
      console.log(text);

      document.getElementById("pageTitle").textContent = text;

      document.querySelectorAll(".sidebar a").forEach((l) => {
        l.classList.remove("active-content");
      });

      this.classList.add("active-content");

      switch (text) {
        // case "Dashboard":
        //   loadDashboard();
        //   break;
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
    });
  });
});
