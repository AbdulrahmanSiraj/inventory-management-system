import {
  makeProductForm,
  makeCategoryForm,
  makeSupplierForm,
  makeOrderForm,
  makeStockAdjustmentForm,
} from "./form.js";

import {
  isVaildProductData,
  isVaildCategoryData,
  isVaildSupplierData,
  isVaildOrderData,
  isVaildStockAdjustmentData,
  GetCurrentDate,         
} from "../utils/helpers.js";

import { postData, updateData, fetchData } from "../services/api.js";
import {getCurrentUser} from "../pages/login.js";

export async function getModal(obj, action, id, onAfterSave) {
  const objModalName = `${obj}Modal`;
  document.querySelector(`#${objModalName}`)?.remove();
  let modalTitle = `${action} ${obj}`;
  if (obj === "stockAdjustments") modalTitle = `${action} Stock Adjustment`;

  let html = `
  <div class="modal fade" id="${objModalName}" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4>${modalTitle}</h4>
        </div>
        <div class="modal-body">`;

  if (obj === "products") html += await makeProductForm(id);
  else if (obj === "categories") html += await makeCategoryForm(id);
  else if (obj === "suppliers") html += await makeSupplierForm(id);
  else if (obj === "orders") html += await makeOrderForm();
  else if (obj === "stockAdjustments") html += await makeStockAdjustmentForm();

  html += `</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary save-btn">Save</button>
          <button type="button" class="btn btn-secondary close-btn" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", html);
  const modalElement = document.querySelector(`#${objModalName}`);
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  if (obj === "orders") setupOrderFormListeners();
  if (obj === "stockAdjustments") setupStockAdjustmentListeners();

  saveBtnEvent(obj, action, id, modal, modalElement, onAfterSave);
  closeBtnEvent(modalElement, modal);
  deleteModal(modalElement);
}


async function saveBtnEvent(obj, action, id, modal, modalElement, onAfterSave) {
  document
    .querySelector(".save-btn")
    .addEventListener("click", async function () {
      const form = document.querySelector("form");
      let data = Object.fromEntries(new FormData(form));

      if (obj === "orders") {
        data.items = JSON.parse(form.dataset.items || "[]");
        data.status = "pending";
        data.orderDate = new Date().toISOString().split("T")[0];
      }

      let productsForAdjustment = null;
      if (obj === "stockAdjustments") {
        productsForAdjustment = await fetchData("products");
      }

      let isVaild = vaildData(obj, data, id, productsForAdjustment);
      if (!isVaild) return;

      if (obj === "stockAdjustments") {
        const product = productsForAdjustment.find((p) => p.id == data.productId);
        if (!product) return;

        const qty = parseInt(data.quantity, 10);
        const type = data.type;
        const reason = data.reason;
        const oldQty = Number(product.quantity) || 0;
        const newQty = type === "increase" ? oldQty + qty : oldQty - qty;
        const nowIso = GetCurrentDate(); 

        await postData("stockAdjustments", {
          productId: product.id,
          productName: product.name,
          type,
          quantity: qty,
          reason,
          date: nowIso,
          oldQuantity: oldQty,
          newQuantity: newQty,
        });

        await updateData("products", product.id, { ...product, quantity: newQty });

        const sign = type === "increase" ? "+" : "−";
        await postData("activityLog", {
          action: "STOCK_ADJUSTMENT",
          details: `Stock adjustment: ${sign}${qty} ${product.name} (${reason})`,
          user: "admin",
          timestamp: nowIso,
        });

        modal.hide();
        if (typeof onAfterSave === "function") await onAfterSave();
        return;
      }

      if (action === "Edit") {
        await updateData(`${obj}`, id, data);
      } else if (action === "Add") {
        await postData(`${obj}`, data);
      }

      if (obj === "products" && action === "Add") {
        await postData("activityLog", {
          action: "CREATE_PRODUCT",
          details: `New product added: ${data.name} (${data.sku})`,
          user: "admin",
          timestamp: GetCurrentDate(),
        });
      } else if (obj === "products" && action === "Edit") {
        await postData("activityLog", {                         
          action: "UPDATE_PRODUCT",
          details: `Product updated: ${data.name} (${data.sku})`,
          user: "admin",
          timestamp: GetCurrentDate(),
        });
      } else if (obj === "orders") {
        await postData("activityLog", {
          action: "CREATE_PURCHASE_ORDER",
          details: `Purchase Order created — ${data.items.length} item(s)`,
          user: `${getCurrentUser()||'unKnown'}`,
          timestamp: GetCurrentDate(),
          createdAt: new Date().toLocaleString(),
        });
      }


      modal.hide();
      if (typeof onAfterSave === "function") {
        await onAfterSave();
      }
    });
}

function vaildData(obj, data, id, products) {
  let result = true;
  if (obj === "products") result = isVaildProductData(data, id);
  else if (obj === "categories") result = isVaildCategoryData(data);
  else if (obj === "suppliers") result = isVaildSupplierData(data);
  else if (obj === "orders") result = isVaildOrderData(data);
  else if (obj === "stockAdjustments") result = isVaildStockAdjustmentData(data, products);
  return result;
}

function closeBtnEvent(modalElement, modal) {
  modalElement
    .querySelector(".close-btn")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to discard changes?")) {
        modal.hide();
      }
    });
}

function deleteModal(modalElement) {
  modalElement.addEventListener("hidden.bs.modal", function () {
    modalElement.remove();
  });
}

//* for orders
function setupOrderFormListeners() {
  let items = [];

  document.getElementById("addItemBtn").addEventListener("click", function () {
    const select = document.getElementById("productSelect");
    const qty = Number(document.getElementById("productQty").value);
    const productId = select.value;
    const productName = select.options[select.selectedIndex].dataset.name;
    if (!productId || qty <= 0) return;

    const existing = items.find((i) => i.productId == productId);
    if (existing) existing.quantity += qty;
    else items.push({ productId, productName, quantity: qty });

    renderItemsList(items);
  });

  document.querySelector(".save-btn").addEventListener(
    "click",
    function () {
      document.querySelector("#appForm").dataset.items = JSON.stringify(items);
    },
    { capture: true },
  );
}

function renderItemsList(items) {
  const list = document.getElementById("itemsList");
  if (items.length === 0) {
    list.innerHTML = `<p class="text-muted small mb-0">No items added yet</p>`;
    return;
  }
  list.innerHTML = items
    .map(
      (item, i) => `
    <div class="d-flex justify-content-between align-items-center mb-1">
      <span>${item.quantity}x ${item.productName}</span>
      <button type="button" class="btn btn-sm btn-link text-danger p-0 remove-item" data-index="${i}">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `,
    )
    .join("");

  list.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", function () {
      items.splice(Number(this.dataset.index), 1);
      renderItemsList(items);
    });
  });
}

function setupStockAdjustmentListeners() {
  const select = document.getElementById("stockAdjProductSelect");
  if (!select) return;
  select.addEventListener("change", updateStockAdjustmentCurrentDisplay);
  updateStockAdjustmentCurrentDisplay();
}

function updateStockAdjustmentCurrentDisplay() {
  const box = document.getElementById("adjCurrentStock");
  const select = document.getElementById("stockAdjProductSelect");
  if (!box || !select) return;
  const opt = select.options[select.selectedIndex];
  if (!select.value || !opt) {
    box.classList.add("d-none");
    box.innerHTML = "";
    return;
  }
  const qty = opt.dataset.qty !== undefined ? Number(opt.dataset.qty) : 0;
  const unit = opt.dataset.unit || "";
  const reorderRaw = opt.dataset.reorder;
  const reorder = reorderRaw !== undefined && reorderRaw !== "" ? Number(reorderRaw) : "—";
  box.classList.remove("d-none");
  let text = `Current stock: <strong>${qty}</strong>`;
  if (unit) text += ` ${unit}`;
  if (reorder !== "—") text += ` &nbsp;|&nbsp; Reorder level: <strong>${reorder}</strong>`;
  box.innerHTML = text;
}
