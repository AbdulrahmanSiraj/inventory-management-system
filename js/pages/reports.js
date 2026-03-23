import { fetchData } from "../services/api.js";

let products = [];

export async function loadReports() {
  products = await fetchData("products");
  renderReports();
}

function renderReports() {
  const lowStock = getLowStockProducts();
  const topValueRows = getTopInventoryValueRows(6);
  const totalValue = getTotalInventoryValue();

  const lowStockHtml = lowStock.length
    ? renderLowStockTable(lowStock)
    : `<div class="text-muted">No low-stock products.</div>`;

  const valueHtml = topValueRows.length
    ? renderValueTable(topValueRows)
    : `<div class="text-muted">No inventory value data.</div>`;

  const summaryHtml = `
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card border-primary shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-box text-primary"></i>
              <div class="fw-semibold">Total Products</div>
            </div>
            <div class="fs-4 fw-bold mt-2">${products.length}</div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card border-warning shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle text-warning"></i>
              <div class="fw-semibold">Low Stock Items</div>
            </div>
            <div class="fs-4 fw-bold mt-2">${lowStock.length}</div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card border-success shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-currency-dollar text-success"></i>
              <div class="fw-semibold">Total Inventory Value</div>
            </div>
            <div class="fs-4 fw-bold mt-2">${formatEGP(totalValue)}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const html = `
    <div class="row g-3 mb-4">
      <div class="col-lg-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-exclamation-circle text-warning"></i>
              <div class="fw-semibold">Low Stock Report</div>
            </div>
            <div class="text-muted small mb-3">Products at or below reorder level</div>
            ${lowStockHtml}
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-currency-dollar text-success"></i>
              <div class="fw-semibold">Inventory Value Report</div>
            </div>
            <div class="text-muted small mb-3">Total value per product</div>
            ${valueHtml}
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="fw-semibold mb-3">Summary</div>
        ${summaryHtml}
      </div>
    </div>
  `;

  document.getElementById("pageContent").innerHTML = html;
}

function getLowStockProducts() {
  return products.filter((p) => Number(p.quantity) <= Number(p.reorderLevel))
    .sort((a, b) => Number(a.quantity) - Number(b.quantity));
}

function getTopInventoryValueRows(limit) {
  const rows = [];
  for (let i = 0; i < products.length; i++) {
    let p = products[i];
    let value = Number(p.price) * Number(p.quantity);

    rows.push({
      id: p.id,
      name: p.name,
      value: value,
    });
  }
  rows.sort((a, b) => b.value - a.value);
  if (typeof limit === "number") {
    return rows.slice(0, limit);
  }
  return rows;
}

function getTotalInventoryValue() {
  let total = 0;

  for (let i = 0; i < products.length; i++) {
    let p = products[i];
    total += Number(p.price) * Number(p.quantity);
  }

  return total;
}

function renderLowStockTable(lowStock) {
  let rowsHtml = "";

  for (let i = 0; i < lowStock.length; i++) {
    let p = lowStock[i];
    let qty = Number(p.quantity);

    let qtyClass = qty <= 0 ? "status-out" : "status-low";

    rowsHtml += `
      <tr>
        <td class="fw-semibold">${p.name}</td>
        <td>
          <span class="status-badge ${qtyClass}">${qty}</span>
        </td>
        <td class="text-muted">${p.reorderLevel}</td>
      </tr>
    `;
  }

  return `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Min</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function renderValueTable(valueRows) {
  let rowsHtml = "";

  for (let i = 0; i < valueRows.length; i++) {
    let r = valueRows[i];

    rowsHtml += `
      <tr>
        <td class="fw-semibold">${r.name}</td>
        <td class="fw-bold text-end">${formatEGP(r.value)}</td>
      </tr>
    `;
  }

  return `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Product</th>
            <th class="text-end">Value</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function formatEGP(amount) {
  let num = Number(amount || 0);
  return `${num.toLocaleString("en-US")} EGP`;
}