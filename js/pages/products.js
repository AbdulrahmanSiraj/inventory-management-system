import renderTable from "../components/table.js";
import renderPagination, { paginateData } from "../components/pagination.js";
import {
  fetchData,
  updateData,
  postData,
  deleteData,
} from "../services/api.js";

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

      //& edit
      const editBtn = e.target.closest(".edit-btn");
      if (editBtn) {
        handleProduct_Edit_Add(editBtn.dataset.id);
        return;
      }

      //& delete
      const deleteBtn = e.target.closest(".delete-btn");
      if (deleteBtn) {
        handleDelete(deleteBtn.dataset.id);
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
      handleProduct_Edit_Add();
    });
}

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

//?????????????????????????????????????????????? handle edit for products
function handleProduct_Edit_Add(id = "") {
  //^ display form modal with data of id
  displayProductForm(id);
}

//* Display modal with form for product
async function displayProductForm(id) {
  //^ if user click edit button then i must select which product he clicked
  let product = "";
  if (id) {
    product = await fetchData(`products/${id}`);
  }
  //^ remove if there is another modal was shown
  document.querySelector("#productModal")?.remove();
  //^ make html code for modal contain form if edit then data will be exist in inputs if add then won't be data exist in inputs
  const html = `
  <div class="modal fade" id="productModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4>${id ? "Edit" : "Add"} Product</h4>
        </div>
        <div class="modal-body">
          <form id='productForm'>
            <div class="row mb-3">
              <div class="col-6">
                <label class="text-secondary" class="form-label" for="name">Product Name *</label>
                <input type="text" class="form-control" name="name" placeholder="e.g Laptop Pro" value= "${id ? product.name : ""}" >
                <div class="text-danger fw-bold errorMes errorMes-name"></div>
              </div>
              <div class="col-6">
                <label class="text-secondary" class="form-label" for="sku">SKU *</label>
                <input type="text" class="form-control" name='sku'  placeholder="e.g LP-001" value="${id ? product.sku : ""}">
                <div class="text-danger fw-bold errorMes errorMes-sku"></div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-6">
                <label class="text-secondary" class="form-label" for="categoryId">Category *</label>
                ${displayOptions("category", product.categoryId, categories)}
              </div>
              <div class="col-6">
                <label class="text-secondary" class="form-label" for="supplierId">Supplier *</label>
                ${displayOptions("supplier", product.supplierId, suppliers)}
              </div>
            </div>


            <div class="row mb-3">
              <div class="col-6">
                <label class="text-secondary" class="form-label" for="price">Pice (EGP) *</label>
                <input type="number" class="form-control" name="price" placeholder="0.00" value= "${id ? product.price : ""}" >
                <div class="text-danger fw-bold errorMes errorMes-price"></div>

              </div>
              <div class="col-6">
                <label class="text-secondary" class="form-label" for="quantity">Quantity *</label>
                <input type="number" class="form-control" name='quantity'  placeholder="0" value="${id ? product.quantity : ""}">
                <div class="text-danger fw-bold errorMes errorMes-quantity"></div>

              </div>
            </div>


            <div class="row mb-3">
              <div class="col-6">
                <label class="text-secondary" class="form-label" for="reorderLevel">Reorder Level *</label>
                <input type="number" class="form-control" name="reorderLevel" placeholder="5" value= "${id ? product.reorderLevel : ""}" >
                <div class="text-danger fw-bold errorMes errorMes-reorderLevel"></div>

              </div>
              <div class="col-6">
                <label class="text-secondary" class="form-label" for="unit">Unit *</label>
                <input type="text" class="form-control" name='unit'  placeholder="Pcs / kg / box" value="${id ? product.unit : ""}">
                <div class="text-danger fw-bold errorMes errorMes-unit"></div>

              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary save-btn">Save</button>
          <button type="button" class="btn btn-secondary close-btn" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
  `;
  //^ show modal
  document.body.insertAdjacentHTML("beforeend", html);
  const modal = new bootstrap.Modal(document.querySelector("#productModal"));
  modal.show();
  // event
  document
    .querySelector(".save-btn")
    .addEventListener("click", async function (e) {
      const form = document.querySelector("#productForm");
      let data = Object.fromEntries(new FormData(form));
      if (isVaildProductData(data, id)) {
        if (id) {
          //edit
          products = await updateData("products", id, data);
        } else {
          //add
          products = await postData("products", data);
        }
        await loadData();
        renderProducts();
      }
    });
  // cancel
  document.querySelector(".close-btn").addEventListener("click", function () {
    if (confirm("Are you sure you want to discard changes?")) {
      const modalElement = document.querySelector("#productModal");
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();
    }
  });
}

function displayOptions(type, id, data) {
  let selectInput = `<select name='${type === "category" ? "categoryId" : "supplierId"}' class="form-select w-100">`;
  data.forEach(function (item) {
    let selected = "";
    if (Number(item.id) === Number(id)) selected = "selected";
    selectInput += `<option value="${item.id}" ${selected}>${item.name}</option>`;
  });
  selectInput += `</select>`;
  return selectInput;
}

function isVaildProductData(data, id) {
  //^ remove all old error messages
  document
    .querySelectorAll(".errorMes")
    .forEach((item) => (item.innerHTML = ""));

  const v1 = isVaildName(data.name);
  const v2 = isVaildSku(data.sku, id);
  const v3 = isVaildNumber(data.price, "price");
  const v4 = isVaildNumber(data.quantity, "quantity");
  const v5 = isVaildUnit(data.unit);
  return v1 && v2 && v3 && v4 && v5;
}
function isVaildName(name) {
  if (name.length === 0) {
    document.querySelector(".errorMes-name").innerHTML =
      `Product Name is required`;
    return false;
  }
  if (name.length <= 3 || name.length > 25) {
    document.querySelector(".errorMes-name").innerHTML =
      `Product Name should be bigger than 3 charchter and less than 25`;
    return false;
  }
  return true;
}
function isVaildSku(sku, id) {
  debugger;
  //^ if empty
  if (sku.length === 0) {
    document.querySelector(".errorMes-sku").innerHTML =
      `Product SKU is required`;
    return false;
  }
  //^ if not vaild format LETTERS-3Digit of number> ABC-123
  const skuRegex = /^[A-Z]+-\d{3}$/;
  if (!skuRegex.test(sku)) {
    document.querySelector(".errorMes-sku").innerHTML =
      "Invalid SKU format. Please use 'LETTERS-000'.";
    return false;
  }

  return true;
}
function isVaildNumber(num, type) {
  if (num.length === 0) {
    document.querySelector(`.errorMes-${type}`).innerHTML =
      `Product ${type} is required`;
    return false;
  }
  num = Number(num);
  if (num <= 0) {
    document.querySelector(`.errorMes-${type}`).innerHTML =
      `Product ${type} should be bigger than zero`;
    return false;
  }
  return true;
}
function isVaildUnit(unit) {
  if (unit.length === 0) {
    document.querySelector(`.errorMes-unit`).innerHTML =
      `Product unit is required`;
    return false;
  }
  let units = ["pcs", "kg", "box"];
  unit = unit.toLowerCase();
  if (!units.includes(unit)) {
    document.querySelector(`.errorMes-unit`).innerHTML =
      `Product unit should be pcs or kg or box`;
    return false;
  }
  return true;
}
