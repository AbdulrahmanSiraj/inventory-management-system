import renderTable from "../components/table.js";
import {
  fetchData,
  deleteData,
} from "../services/api.js";
import {getModal} from "../components/modal.js";
let products = [];
let categories = [];
let suppliers = [];

export async function loadProducts() {
  await loadData();
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
    <!-- Search Bar -->
    <div class="d-flex gap-1 mb-3 align-items-center p-3 bg-white rounded border">
      <i class="bi bi-search text-muted"></i>
      <input type="text" id="searchProd" placeholder="Search products..." 
        class="form-control form-control-sm border-0 shadow-none">
      <select id="categoryFilter" class="form-select form-select-sm border-0 shadow-none" style="width: 160px;">
        <option value="">All Categories</option>
        ${categoryOptions}
      </select>
      <select id="statusFilter" class="form-select form-select-sm border-0 shadow-none" style="width: 130px;">
        <option value="">All Status</option>
        <option value="in">In Stock</option>
        <option value="low">Low Stock</option>
        <option value="out">Out of Stock</option>
      </select>
      <button class="btn btn-primary btn-sm px-3 ms-auto w-auto" id="addProductBtn">
        <i class="bi bi-plus-lg"></i> Add Product
      </button>
    </div>

    <div id="searchStats" class="mb-2 small text-muted"></div>
    
    <!-- Table Container -->
    <div id="productsTableContainer">
      ${getTableHtml()}
    </div>
  `;

  document.getElementById("pageContent").innerHTML = html;
}

//* to bring the table whatever there is a filter/ search/ all prods
function getTableHtml(filteredProducts = products) {
  let tableData = filteredProducts.map((p) => ({
    id: p.id,
    sku: `<span class="sku-badge">${p.sku}</span>`,
    name: p.name,
    category: getCategoryName(p.categoryId),
    supplier: getSupplierName(p.supplierId),
    price: p.price,
    quantity: p.quantity,
    status: getStatus(p.quantity),
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

  return renderTable(tableData, columns);
}

//* for all event listeners
function setupEventListeners() {
  //& Search
  document.getElementById("searchProd")?.addEventListener("input", function () {
    filterProducts();
  });

  //& Filter by category
  document
    .getElementById("categoryFilter")
    ?.addEventListener("change", function () {
      filterProducts();
    });

  //& Filter by status
  document
    .getElementById("statusFilter")
    ?.addEventListener("change", function () {
      filterProducts();
    });
  //^ Edit & delete product 
  document.querySelector("#productsTableContainer").addEventListener('click',function(e){
    const editBtn= e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    if(editBtn){
      const id = editBtn.dataset.id;
      handleEdit(id);
    }
    else if(deleteBtn){
      const id = deleteBtn.dataset.id;
      handleDelete(id);
    }
  }); 
  //^ add
  document.querySelector("#addProductBtn").addEventListener('click',function(){
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
      if (statusFilter === "low" && (p.quantity <= 0 || p.quantity > 5))
        return false;
      if (statusFilter === "in" && p.quantity <= 5) return false;
    }

    return true;
  });

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

  if (searchTerm || categoryId || statusFilter) {
    statsDiv.innerHTML = `Found ${count} product${count !== 1 ? "s" : ""}`;
  } else {
    statsDiv.innerHTML = "";
  }
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
function getStatus(quantity) {
  if (quantity <= 0)
    return `<span class="status-badge status-out">Out of stock</span>`;
  else if (quantity <= 5)
    return `<span class="status-badge status-low">Low stock</span>`;
  else return `<span class="status-badge status-in">In stock</span>`;
}

//* add button
function handleAdd(id=''){
  getModal('products', 'Add',id);
} 
//* edit button
function handleEdit(id){
  getModal('products','Edit',id);
}
//* delete button
async function handleDelete(id) {
  let p = products.find((e) => e.id == id);
  if (!p) return;

  let ok = confirm(`Delete product "${p.name}"?`);
  if (!ok) return;

  await deleteData("products", id);
  await loadData();

  // keep current filters/search
  filterProducts();
}