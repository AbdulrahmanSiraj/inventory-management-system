import {
  makeProductForm,
  makeCategoryForm,
  makeSupplierForm,
  makeOrderForm,
} from "./form.js";

import {
  isVaildProductData,
  isVaildCategoryData,
  isVaildSupplierData,
  isVaildOrderData,
} from "../utils/helpers.js";

import { postData, updateData } from "../services/api.js";

export async function getModal(obj, action, id) {
  const objModalName = `${obj}Modal`;
  document.querySelector(`#${objModalName}`)?.remove();
  let html = `
  <div class="modal fade" id="${objModalName}" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4>${action} ${obj}</h4>
        </div>
        <div class="modal-body">`;

  if (obj === "products") html += await makeProductForm(id);
  else if (obj === "categories") html += await makeCategoryForm(id);
  else if (obj === "suppliers") html += await makeSupplierForm(id);
  else if (obj === "orders") html += await makeOrderForm();

  html += `</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary save-btn">Save</button>
          <button type="button" class="btn btn-secondary close-btn" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>`;
  //^ show modal
  document.body.insertAdjacentHTML("beforeend", html);
  const modalElement = document.querySelector(`#${objModalName}`);
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
  if (obj === "orders") setupOrderFormListeners();
  //^ handle events Save - Close - Delete Modal
  saveBtnEvent(obj, action, id);
  closeBtnEvent(modalElement);
  deleteModal(modalElement);
}

function saveBtnEvent(obj, action, id) {
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
      let isVaild = vaildData(obj, data, id);
      if (isVaild) {
        if (action === "Edit") await updateData(`${obj}`, id, data);
        else if (action === "Add") await postData(`${obj}`, data);
        location.reload();
      }
    });
}
function vaildData(obj, data, id) {
  let result = true;
  if (obj === "products") result = isVaildProductData(data, id);
  else if (obj === "categories") result = isVaildCategoryData(data);
  else if (obj === "suppliers") result = isVaildSupplierData(data);
  else if (obj === "orders") result = isVaildOrderData(data);
  return result;
}

function closeBtnEvent(modalElement) {
  modalElement
    .querySelector(".close-btn")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to discard changes?")) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
      }
    });
}
//* Delete modal from html code after it hidden
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
