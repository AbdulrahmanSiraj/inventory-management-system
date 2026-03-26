import renderTable from "../components/table.js";
import {
  fetchData,
  deleteData,
} from "../services/api.js";
import { getModal } from "../components/modal.js";

let products = [];
let categories = [];
let suppliers = [];

export async function loadSuppliers() {
  await loadData();
  renderSuppliers();
  setupEventListeners();
}

async function loadData() {
  products = await fetchData("products");
  categories = await fetchData("categories");
  suppliers = await fetchData("suppliers");
}

//* render the whole html of Suppliers page
function renderSuppliers() {
  let html = `
  <div class="d-flex gap-2 mb-3 align-items-center p-3 bg-white rounded border">
    <i class="bi bi-search text-muted"></i>
    <input type="text" id="searchSup" placeholder="Search suppliers..." 
      class="form-control form-control-sm border-0 shadow-none">

    <button class="btn btn-primary btn-sm px-3 ms-auto text-nowrap" id="addSupplierBtn">
      <i class="bi bi-plus-lg"></i> Add Supplier
    </button>
  </div>
  
  <div id="searchStats" class="mb-2 small text-muted"></div>
  
  <div id="suppliersTableContainer">
      ${getTableHtml()}
  </div>
`;

  document.getElementById("pageContent").innerHTML = html;
}

//* to bring the table whatever there is a filter/ search
function getTableHtml(filteredSuppliers = suppliers) {
  let tableData = filteredSuppliers.map((s) => ({
    id: s.id,
    name: s.name,
    contact: s.contact || "-",
    email: s.email || "-",
    phone: s.phone || "-",
    address: s.address || "-",
    products: getProductsNumber(s.id),
  }));

  let columns = [
    "id",
    "name",
    "contact",
    "email",
    "phone",
    "address",
    "products",
  ];

  return renderTable(tableData, columns);
}

//* for all event listeners
function setupEventListeners() {
  document
    .getElementById("searchSup")
    ?.addEventListener("input", filterSuppliers);

  //^ Edit & delete product 
  document.querySelector("#suppliersTableContainer").addEventListener('click',function(e){
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
  document.querySelector("#addSupplierBtn").addEventListener('click',function(){
    handleAdd();
  });
}


//* add button
function handleAdd(id=''){
  getModal('suppliers', 'Add',id);
} 
//* edit button
function handleEdit(id){
  getModal('suppliers','Edit',id);
}


async function handleDelete(id) {
  let s = suppliers.find((e) => e.id == id);
  if (!s) return;

  let productsCount = products.filter((p) => p.supplierId == id).length;
  if (productsCount > 0) {
    alert("You can't delete this supplier because it has products.");
    return;
  }

  let ok = confirm(`Delete supplier "${s.name}"?`);
  if (!ok) return;

  await deleteData("suppliers", id);
  await loadData();
  filterSuppliers();
}

//* search function
function filterSuppliers() {
  let searchTerm = document.getElementById("searchSup").value.toLowerCase();

  //^ Search by ( name, contact, email, phone, address)
  let filtered = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm)
      || (s.contact && s.contact.toLowerCase().includes(searchTerm))
      || (s.email && s.email.toLowerCase().includes(searchTerm))
      || (s.phone && s.phone.includes(searchTerm))
      || (s.address && s.address.toLowerCase().includes(searchTerm))
    );
  });

  //& Update Table
  document.getElementById("suppliersTableContainer").innerHTML =
    getTableHtml(filtered);

  //& Update stats
  updateStats(filtered.length, searchTerm);
}

//* stats
function updateStats(count, searchTerm) {
  let statsDiv = document.getElementById("searchStats");
  if (!statsDiv) return;

  if (searchTerm) {
    statsDiv.innerHTML = `Found ${count} supplier${count !== 1 ? "s" : ""} matching "${searchTerm}"`;
  } else {
    statsDiv.innerHTML = "";
  }
}

//* get products count for supplier
function getProductsNumber(id) {
  let count = products.filter((p) => p.supplierId == id).length;
  return `<span class="badge rounded-pill px-2" style="background:#eff6ff; color:#3b82f6;">${count}</span>`;
}
