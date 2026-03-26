import {
  fetchData,
} from "../services/api.js";
export async function makeProductForm(id) {
  let product='';
  if(id){
    product =  await fetchData(`products/${id}`);
  }
  const categories = await fetchData("categories");
  const suppliers = await fetchData("suppliers");
  let html = `
  <form>
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
        ${displayProductsOptions("category", product.categoryId, categories)}
      </div>
      <div class="col-6">
        <label class="text-secondary" class="form-label" for="supplierId">Supplier *</label>
        ${displayProductsOptions("supplier", product.supplierId, suppliers)}
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
  </form>`;
  return html;
}
function displayProductsOptions(type,id,data){
  let selectInput = `<select name='${type==='category'?'categoryId':'supplierId'}' class="form-select w-100">`;
  data.forEach(function(item){
    let selected='';
    if(Number(item.id)===Number(id))
      selected='selected';
    selectInput+=`<option value="${item.id}" ${selected}>${item.name}</option>`
  })
  selectInput+=`</select>`;
  return selectInput;
}

export async function makeCategoryForm(id) {
  let category='';
  if(id){
    category =  await fetchData(`categories/${id}`);
  }
  let html = `
  <form>
    <div class="row mb-3">
      <div class="col-12">
        <label class="text-secondary" class="form-label" for="name">Category Name *</label>
        <input type="text" class="form-control" name="name" placeholder="e.g Electronics" value= "${id ? category.name : ""}" >
        <div class="text-danger fw-bold errorMes errorMes-name"></div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-12">
        <label class="text-secondary" class="form-label" for="description">Description *</label>
        <input type="text" class="form-control" name='description'  placeholder="e.g Short description" value="${id ? category.description : ""}">
        <div class="text-danger fw-bold errorMes errorMes-description"></div>
      </div>
    </div>
  </form>`;
  return html;
}

export async function makeSupplierForm(id) {
    let supplier='';
  if(id){
    supplier =  await fetchData(`suppliers/${id}`);
  }
  let html = `
  <form>
    <div class="row mb-3">

      <div class="col-6">
        <label class="text-secondary" class="form-label" for="name">Supplier Name *</label>
        <input type="text" class="form-control" name="name" placeholder="Company name" value= "${id ? supplier.name : ""}" >
        <div class="text-danger fw-bold errorMes errorMes-name"></div>
      </div>

      <div class="col-6">
        <label class="text-secondary" class="form-label" for="contact">Contact Person *</label>
        <input type="text" class="form-control" name="contact" placeholder="Full name" value= "${id ? supplier.contact : ""}" >
        <div class="text-danger fw-bold errorMes errorMes-contact"></div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-6">
        <label class="text-secondary" class="form-label" for="email">Email *</label>
        <input type="text" class="form-control" name="email" placeholder="email@domain.com" value= "${id ? supplier.email : ""}" >
        <div class="text-danger fw-bold errorMes errorMes-email"></div>
      </div>
      <div class="col-6">
        <label class="text-secondary" class="form-label" for="phone">Phone *</label>
        <input type="text" class="form-control" name="phone" placeholder="+20..." value= "${id ? supplier.phone : ""}" >
        <div class="text-danger fw-bold errorMes errorMes-phone"></div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-6">
        <label class="text-secondary" class="form-label" for="address">Address *</label>
        <input type="text" class="form-control" name="address" placeholder="e.g Alexandria, Egypt" value= "${id ? supplier.adress : ""}" >
        <div class="text-danger fw-bold errorMes errorMes-address"></div>
      </div>
    </div>

  </form>`;
  return html;
}