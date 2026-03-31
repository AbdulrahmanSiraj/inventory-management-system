import renderTable from "../components/table.js";
import { fetchData, postData, updateData } from "../services/api.js";
import { getModal } from "../components/modal.js";
import renderPagination, { paginateData } from "../components/pagination.js";
import { sortData } from "../utils/helpers.js";
import {getCurrentUser} from "../pages/login.js";
let products = [];
let categories = [];
let suppliers = [];
let lastFiltered = [];
let orders = [];
let currentPage = 1;
let PAGE_SIZE = 5;

export async function loadOrders() {
  await loadData();
  renderOrders();
  setupEventListeners();
}

async function loadData() {
  products = await fetchData("products");
  categories = await fetchData("categories");
  suppliers = await fetchData("suppliers");
  orders = await fetchData("orders");
  orders = sortData(orders);
  lastFiltered = [...orders];
}

//* render the whole html of Orders page
function renderOrders() {
  let html = `
  <div class="d-flex gap-2 mb-3 align-items-center flex-wrap p-3 bg-white rounded border">
  <i class="bi bi-search text-muted d-none d-sm-block"></i>
  <input type="text" id="searchOrder" placeholder="Search orders..."
    class="form-control form-control-sm border-0 shadow-none" style="flex:1; min-width:150px;">
  <select id="statusFilter" class="form-select form-select-sm border-0 shadow-none w-auto">
    <option value="">All Status</option>
    <option value="pending">Pending</option>
    <option value="received">Received</option>
  </select>
  <button class="btn btn-primary btn-sm px-3 ms-auto text-nowrap" id="addOrderBtn">
    <i class="bi bi-plus-lg"></i> New Purchase Order
  </button>
</div>
    
    <div id="searchStats" class="mb-2 small text-muted"></div>
    
    <div id="ordersTableContainer">
      ${getTableHtml()}
    </div>
  `;

  document.getElementById("pageContent").innerHTML = html;
}

//* to bring the table whatever there is a filter/ search/ all cats
function getTableHtml(filteredOrders = orders) {
  const paginated = paginateData(filteredOrders, currentPage, PAGE_SIZE);
  let tableData = paginated.map((o) => ({
    id: o.id,
    supplier: getSupplierName(o.supplierId),
    items: getItems(o.items),
    orderDate: new Date(o.orderDate).toLocaleDateString("en-CA"),
    status: getStatusBadge(o.status),
    actions:
      o.status === "pending"
        ? `<button class="btn btn-success btn-sm px-3 receive-btn" data-id="${o.id}"><i class="bi bi-check2-all"></i> Receive</button>`
        : `<span class="text-muted">Completed</span>`,
  }));

  let columns = ["supplier", "items", "orderDate", "status", "actions"];
  return (
    renderTable(tableData, columns, false)
    + renderPagination(filteredOrders.length, currentPage, PAGE_SIZE)
  );
}

function getSupplierName(id) {
  let sup = suppliers.find((sup) => sup.id == id);
  return sup.name;
}
function getItems(items) {
  let names = [];
  items.forEach((item) => {
    names.push(item.quantity + "x " + item.productName);
  });
  return names.join(", ");
}
function getStatusBadge(status) {
  if (status === "pending")
    return `<span class="badge rounded-pill" style="background:#fef9c3;color:#854d0e;font-weight:600;">${status}</span>`;
  return `<span class="badge rounded-pill" style="background:#dcfce7;color:#166534;font-weight:600;">${status}</span>`;
}

//* for all event listeners
function setupEventListeners() {
  document
    .querySelector("#ordersTableContainer")
    .addEventListener("click", function (e) {
      //& pagination
      const pageBtn = e.target.closest(".page-link");
      if (pageBtn) {
        const page = Number(pageBtn.dataset.page);
        const totalPages = Math.ceil(lastFiltered.length / PAGE_SIZE);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        document.getElementById("ordersTableContainer").innerHTML =
          getTableHtml(lastFiltered);
        return;
      }
      const receiveBtn = e.target.closest(".receive-btn");
      if (receiveBtn) {
        const id = receiveBtn.dataset.id;
        handleReceive(id);
      }
    });

  //& Limit
  document
    .querySelector("#ordersTableContainer")
    .addEventListener("change", (e) => {
      const pageSizeSelect = e.target.closest(".page-size-select");
      if (pageSizeSelect) {
        PAGE_SIZE = Number(pageSizeSelect.value);
        currentPage = 1;
        document.getElementById("ordersTableContainer").innerHTML =
          getTableHtml(lastFiltered);
        return;
      }
    });

  //& Filter by status
  document
    .getElementById("statusFilter")
    ?.addEventListener("change", filterOrders);

  //& Search
  document
    .getElementById("searchOrder")
    ?.addEventListener("input", filterOrders);

  //& Add product
  document.querySelector("#addOrderBtn").addEventListener("click", function () {
    handleAdd();
  });
}

//* Filter and Search function
function filterOrders() {
  let searchTerm = document.getElementById("searchOrder").value.toLowerCase();
  let statusFilter = document.getElementById("statusFilter").value;

  let filtered = orders.filter((o) => {
    //^ Search by (sku, name, category, supplier)
    if (searchTerm) {
      let matches =
        getSupplierName(o.supplierId).toLowerCase().includes(searchTerm)
        || getItems(o.items).toLowerCase().includes(searchTerm)
        || (o.expectedDate && o.expectedDate.includes(searchTerm))
        || (o.orderDate && o.orderDate.includes(searchTerm));
      if (!matches) return false;
    }

    //^ Filter by status
    if (statusFilter) {
      if (statusFilter === "pending") return o.status === "pending";
      if (statusFilter === "received") return o.status === "received";
    }
    return true;
  });

  lastFiltered = filtered;
  currentPage = 1;

  //& Change Table data
  document.getElementById("ordersTableContainer").innerHTML =
    getTableHtml(filtered);

  //& update status
  updateStats(filtered.length, searchTerm);
}

//* stats
function updateStats(count, searchTerm) {
  let statsDiv = document.getElementById("searchStats");
  if (!statsDiv) return;

  if (searchTerm) {
    statsDiv.innerHTML = `Found ${count} order${count !== 1 ? "s" : ""} matching "${searchTerm}"`;
  } else {
    statsDiv.innerHTML = "";
  }
}

//* add button
function handleAdd() {
  getModal("orders", "Add", "", () => loadOrders());
}

//* receive button
async function handleReceive(id) {
  let order = orders.find((o) => o.id == id);
  if (!order) return;

  let supplierName = getSupplierName(order.supplierId);
  let itemsList = order.items
    .map(
      (item) =>
        `<li><strong>+ ${item.quantity}</strong> × ${item.productName} will be added to inventory</li>`,
    )
    .join("");

  document.querySelector("#receiveModal")?.remove();

  let html = `
      <div class="modal fade" id="receiveModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title fw-bold">Receive Purchase Order</h5>
            </div>
            <div class="modal-body">
              <div class="p-3 rounded mb-3" style="background:#f0fdf4; border:1px solid #bbf7d0;">
                <p class="fw-bold mb-2">Order #${order.id} – ${supplierName}</p>
                <ul class="mb-0 ps-3">
                  ${itemsList}
                </ul>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-success px-4" id="confirmReceiveBtn">
                <i class="bi bi-check2"></i> Confirm Receipt
              </button>
            </div>
          </div>
        </div>
      </div>`;

  document.body.insertAdjacentHTML("beforeend", html);
  const modalElement = document.querySelector("#receiveModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  document
    .getElementById("confirmReceiveBtn")
    .addEventListener("click", async function () {
      await updateData("orders", id, { ...order, status: "received" });
      // debugger;
      //* add receive order to activity log
      try{
      await postData("activityLog",{
        action:"RECEIVE_ORDER",
        details:`Receive Order that was created in ${order.orderDate} that contains ${order.items.length} item`,
        user: getCurrentUser()?.name || "Unknown",
        timestamp: new Date().toLocaleString(),
        createdAt: new Date().toLocaleString(),
      });
    } catch(error){
      console.log("insert receive order is failed ",error);
    }

      for (let item of order.items) {
        let product = products.find((p) => p.id == item.productId);
        if (product) {
          let newQty = Number(product.quantity) + Number(item.quantity);
          await updateData("products", product.id, {
            ...product,
            quantity: newQty,
          });
        }
      }

      modal.hide();
      await loadData();
      document.getElementById("ordersTableContainer").innerHTML =
        getTableHtml(lastFiltered);
    });

  modalElement.addEventListener("hidden.bs.modal", () => modalElement.remove());
}
