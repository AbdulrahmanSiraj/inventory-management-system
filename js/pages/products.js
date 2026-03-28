import renderTable from "../components/table.js";
import renderPagination, { paginateData } from "../components/pagination.js";
import {
  fetchData,
  updateData,
  postData,
  deleteData,
} from "../services/api.js";
import { getModal } from "../components/modal.js";

let products = [];
let categories = [];
let suppliers = [];
let lastFiltered = [];
let currentPage = 1;
let PAGE_SIZE = 5;

export async function loadProducts() {
  await loadData();
  lastFiltered = [...products];
  renderProducts();
  setupEventListeners();
}

async function loadData() {
  products = await fetchData("products");
  categories = await fetchData("categories");
  suppliers = await fetchData("suppliers");
}

//* render the whole html of products page
function renderProducts() {
  let categoryOptions = categories
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");

  let html = `
    <div class="d-flex gap-1 mb-3 align-items-center p-3 bg-white rounded border">
      <i class="bi bi-search text-muted"></i>
      <input type="text" id="searchProd" placeholder="Search products..." 
        class="form-control form-control-sm border-0 shadow-none">
      <select id="categoryFilter" class="form-select form-select-sm border-0 shadow-none form-select-product-category">
        <option value="">All Categories</option>
        ${categoryOptions}
      </select>
      <select id="statusFilter" class="form-select form-select-sm border-0 shadow-none form-select-product-status">
        <option value="">All Status</option>
        <option value="in">In Stock</option>
        <option value="low">Low Stock</option>
        <option value="out">Out of Stock</option>
      </select>
      <button class="btn btn-primary btn-sm px-3 ms-auto text-nowrap" id="addProductBtn">
        <i class="bi bi-plus-lg"></i> Add Product
      </button>
    </div>

    <div id="searchStats" class="mb-2 small text-muted"></div>
    
    <div id="productsTableContainer">
      ${getTableHtml()}
    </div>
  `;

  document.getElementById("pageContent").innerHTML = html;
}

//* to bring the table whatever there is a filter/ search/ all prods
function getTableHtml(filteredProducts = products) {
  const paginated = paginateData(filteredProducts, currentPage, PAGE_SIZE);

  let tableData = paginated.map((p) => ({
    id: p.id,
    sku: `<span class="sku-badge">${p.sku}</span>`,
    name: p.name,
    category: getCategoryName(p.categoryId),
    supplier: getSupplierName(p.supplierId),
    price: p.price,
    quantity: p.quantity,
    status: getStatus(p.quantity, p.reorderLevel),
  }));

  let columns = [
    "sku",
    "name",
    "category",
    "supplier",
    "price",
    "quantity",
    "status",
  ];

  return (
    renderTable(tableData, columns)
    + renderPagination(filteredProducts.length, currentPage, PAGE_SIZE)
  );
}

//* for all event listeners
function setupEventListeners() {
  //& Search
  document
    .getElementById("searchProd")
    ?.addEventListener("input", filterProducts);

  //& Filter by category
  document
    .getElementById("categoryFilter")
    ?.addEventListener("change", filterProducts);

  //& Filter by status
  document
    .getElementById("statusFilter")
    ?.addEventListener("change", filterProducts);

  document
    .querySelector("#productsTableContainer")
    .addEventListener("click", function (e) {
      //& pagination
      const pageBtn = e.target.closest(".page-link");
      if (pageBtn) {
        const page = Number(pageBtn.dataset.page);
        const totalPages = Math.ceil(lastFiltered.length / PAGE_SIZE);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        document.getElementById("productsTableContainer").innerHTML =
          getTableHtml(lastFiltered);
        return;
      }

      //& edit and delete
      const editBtn = e.target.closest(".edit-btn");
      const deleteBtn = e.target.closest(".delete-btn");
      if (editBtn) {
        const id = editBtn.dataset.id;
        handleEdit(id);
      } else if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        handleDelete(id);
      }
    });

  //& Limit
  document
    .querySelector("#productsTableContainer")
    .addEventListener("change", (e) => {
      const pageSizeSelect = e.target.closest(".page-size-select");
      if (pageSizeSelect) {
        PAGE_SIZE = Number(pageSizeSelect.value);
        currentPage = 1;
        document.getElementById("productsTableContainer").innerHTML =
          getTableHtml(lastFiltered);
        return;
      }
    });

  //& add
  document
    .querySelector("#addProductBtn")
    .addEventListener("click", function () {
      handleAdd();
    });
}

//* Filter and Search function
function filterProducts() {
  let searchTerm = document.getElementById("searchProd").value.toLowerCase();
  let categoryId = document.getElementById("categoryFilter").value;
  let statusFilter = document.getElementById("statusFilter").value;

  let filtered = products.filter((p) => {
    //^ Search by (sku, name, category, supplier)
    if (searchTerm) {
      let matches =
        p.name.toLowerCase().includes(searchTerm)
        || p.sku.toLowerCase().includes(searchTerm)
        || getCategoryName(p.categoryId).toLowerCase().includes(searchTerm)
        || getSupplierName(p.supplierId).toLowerCase().includes(searchTerm);
      if (!matches) return false;
    }

    //^ Filter by Category
    if (categoryId && p.categoryId != categoryId) return false;

    //^ Filter by status
    if (statusFilter) {
      if (statusFilter === "out" && p.quantity > 0) return false;
      if (
        statusFilter === "low"
        && (p.quantity <= 0 || p.quantity > Number(p.reorderLevel))
      )
        return false;
      if (statusFilter === "in" && p.quantity <= Number(p.reorderLevel))
        return false;
    }

    return true;
  });

  lastFiltered = filtered;
  currentPage = 1;

  //& Change Table data
  document.getElementById("productsTableContainer").innerHTML =
    getTableHtml(filtered);

  //& update status
  updateStats(filtered.length, searchTerm, categoryId, statusFilter);
}

//* stats
function updateStats(count, searchTerm, categoryId, statusFilter) {
  let statsDiv = document.getElementById("searchStats");
  if (!statsDiv) return;
  statsDiv.innerHTML =
    searchTerm || categoryId || statusFilter
      ? `Found ${count} product${count !== 1 ? "s" : ""}`
      : "";
}

//* get category name
function getCategoryName(id) {
  let cat = categories.find((e) => e.id == id);
  return cat ? cat.name : "undefined";
}

//* get supplier name
function getSupplierName(id) {
  let sup = suppliers.find((e) => e.id == id);
  return sup ? sup.name : "undefined";
}

//* get status of products
function getStatus(quantity, reorderLevel) {
  if (quantity <= 0)
    return `<span class="status-badge status-out">Out of stock</span>`;
  else if (quantity <= Number(reorderLevel))
    return `<span class="status-badge status-low">Low stock</span>`;
  else return `<span class="status-badge status-in">In stock</span>`;
}


//* add button
function handleAdd(id = "") {
  getModal("products", "Add", id);
}
//* edit button
function handleEdit(id) {
  getModal("products", "Edit", id);
}
//* delete button
async function handleDelete(id) {
  let p = products.find((e) => e.id == id);
  if (!p) return;

  let ok = confirm(`Delete product "${p.name}"?`);
  if (!ok) return;

  await deleteData("products", id);
  await loadData();

  filterProducts();
}
