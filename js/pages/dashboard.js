import { fetchData } from "../services/api.js";
import {
  formatEGP,
  getLowStockProducts,
  getTotalInventoryValue,
  getPendingOrdersCount,
  activityRowHtml,
} from "../utils/helpers.js";

let products = [];
let categories = [];
let orders = [];
let activities = [];

export async function loadDashboard() {
  products = await fetchData("products");
  categories = await fetchData("categories");
  orders = await fetchData("orders");
  activities = await fetchData("activityLog");
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  renderDashboard();
}

function renderDashboard() {
  const lowStock = getLowStockProducts(products);
  const totalValue = getTotalInventoryValue(products);
  const pendingCount = getPendingOrdersCount(orders);
  const recentActivities = activities.slice(0, 5);

  const alertHtml = lowStock.length
    ? `
    <div class="alert alert-warning d-flex align-items-start gap-2 mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1"></i>
      <span>${lowStock.length} product(s) are low on stock: ${lowStock.map((p) => p.name).join(", ")}</span>
    </div>`
    : "";

  const statsHtml = `
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-primary shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 text-muted small">
              <i class="bi bi-box text-primary"></i>
              <span>Total Products</span>
            </div>
            <div class="fs-4 fw-bold mt-2">${products.length}</div>
            <div class="small text-muted mt-1">Across ${categories.length} categories</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card ${lowStock.length ? "border-danger" : "border-success"} shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 text-muted small">
              <i class="bi bi-exclamation-triangle ${lowStock.length ? "text-danger" : "text-success"}"></i>
              <span>Low Stock</span>
            </div>
            <div class="fs-4 fw-bold mt-2 ${lowStock.length ? "text-danger" : "text-success"}">${lowStock.length}</div>
            <div class="small text-muted mt-1">${lowStock.length ? "Needs reorder" : "All good"}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-warning shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 text-muted small">
              <i class="bi bi-cart-check text-warning"></i>
              <span>Pending Orders</span>
            </div>
            <div class="fs-4 fw-bold mt-2 text-warning">${pendingCount}</div>
            <div class="small text-muted mt-1">Awaiting receipt</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-success shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 text-muted small">
              <i class="bi bi-currency-dollar text-success"></i>
              <span>Inventory Value</span>
            </div>
            <div class="fs-4 fw-bold mt-2 text-success">${formatEGP(totalValue)}</div>
            <div class="small text-muted mt-1">Total stock value</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const lowStockCardHtml = lowStock.length
    ? renderDashboardLowStockList(lowStock)
    : `<p class="text-muted">All products are sufficiently stocked.</p>`;

  const activityHtml =
    recentActivities.length > 0
      ? recentActivities.map(activityRowHtml).join("")
      : `<p class="text-muted">No recent activity.</p>`;

  const html = `
    ${alertHtml}
    ${statsHtml}
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="bg-white rounded border p-4 h-100">
          <h6 class="fw-bold mb-3">Low Stock Products</h6>
          ${lowStockCardHtml}
        </div>
      </div>
      <div class="col-lg-6">
        <div class="bg-white rounded border p-4 h-100">
          <h6 class="fw-bold mb-3">Recent Activity</h6>
          <div id="dashRecentActivity">
            ${activityHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("pageContent").innerHTML = html;
}

function renderDashboardLowStockList(lowStock) {
  let rows = "";
  for (let i = 0; i < lowStock.length; i++) {
    let p = lowStock[i];
    let qty = Number(p.quantity);
    let qtyClass = qty <= 0 ? "status-out" : "status-low";
    rows += `
      <div class="d-flex align-items-center justify-content-between py-3 border-bottom">
        <div>
          <div class="fw-medium">${p.name}</div>
          <small class="text-muted">SKU: ${p.sku}</small>
        </div>
        <div class="text-end">
          <span class="status-badge ${qtyClass}">${qty} ${p.unit}</span>
          <div class="small text-muted mt-1">Min: ${p.reorderLevel}</div>
        </div>
      </div>
    `;
  }
  return rows;
}
