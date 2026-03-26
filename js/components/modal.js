import {
  makeProductForm,
  makeCategoryForm,
  makeSupplierForm
} from "./form.js";

import {
  isVaildProductData,
  isVaildCategoryData,
  isVaildSupplierData
} from "../utils/helpers.js";

import {
  postData,
  updateData,
} from "../services/api.js";

export async function getModal(obj, action,id) {
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
  else if (obj === "categories") html +=await makeCategoryForm(id);
  else if (obj === "suppliers") html +=await makeSupplierForm(id);

  html+=`</div>
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
  //^ handle events Save - Close - Delete Modal
  saveBtnEvent(obj,action,id);
  closeBtnEvent(modalElement);
  deleteModal(modalElement);
}

function saveBtnEvent(obj,action,id){
  document.querySelector(".save-btn").addEventListener("click", async function () {
    const form = document.querySelector("form");
    let data = Object.fromEntries(new FormData(form));
    let isVaild=vaildData(obj,data,id);
    if (isVaild) {
      if (action==='Edit') 
        products = await updateData(`${obj}`, id, data);
      else if(action==='Add')
        products = await postData(`${obj}`, data);
    }
  });
}
function vaildData(obj,data,id){
  let result=true;
  if(obj==='products')
    result=isVaildProductData(data,id);
  else if(obj==='categories')
    result=isVaildCategoryData(data);
  else if(obj==='suppliers')
    result=isVaildSupplierData(data);
  return result;
}

function closeBtnEvent(modalElement) {
  modalElement.querySelector(".close-btn").addEventListener('click', function() {
    if (confirm("Are you sure you want to discard changes?")) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();
    }
  });
}
//* Delete modal from html code after it hidden 
function deleteModal(modalElement) {
  modalElement.addEventListener('hidden.bs.modal', function () {
    modalElement.remove(); 
  });
}