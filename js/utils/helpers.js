//* Validation Functions for Products 
export function isVaildProductData(data, id) {
  //^ remove all old error messages
  document.querySelectorAll('.errorMes').forEach(item => item.innerHTML = '');

  const v1 = isVaildName(data.name);
  const v2 = isVaildSku(data.sku, id);
  const v3 = isVaildNumber(data.price, 'price');
  const v4 = isVaildNumber(data.quantity, 'quantity');
  const v5 = isVaildNumber(data.reorderLevel, 'reorderLevel');
  const v6 = isVaildUnit(data.unit);
  return v1 && v2 && v3 && v4 && v5 && v6;
}
function isVaildName(name) {
  if (name.length === 0) {
    document.querySelector('.errorMes-name').innerHTML = `Product Name is required`;
    return false;
  }
  if (name.length <= 3 || name.length > 25) {
    document.querySelector('.errorMes-name').innerHTML = `Product Name should be bigger than 3 charchter and less than 25`;
    return false;
  }
  return true;
}
function isVaildSku(sku) {
  //^ if empty
  if (sku.length === 0) {
    document.querySelector('.errorMes-sku').innerHTML = `Product SKU is required`;
    return false;
  }
  //^ if not vaild format LETTERS-3Digit of number> ABC-123
  const skuRegex = /^[A-Z]+-\d{3}$/;
  if (!skuRegex.test(sku)) {
    document.querySelector('.errorMes-sku').innerHTML = "Invalid SKU format. Please use 'LETTERS-000'.";
    return false;
  }
  return true;
}
function isVaildNumber(num, type) {
  if (num.length === 0) {
    document.querySelector(`.errorMes-${type}`).innerHTML = `Product ${type} is required`;
    return false;
  }
  num = Number(num);
  if (num <= 0) {
    document.querySelector(`.errorMes-${type}`).innerHTML = `Product ${type} should be bigger than zero`;
    return false;
  }
  return true;
}
function isVaildUnit(unit) {
  if (unit.length === 0) {
    document.querySelector(`.errorMes-unit`).innerHTML = `Product unit is required`;
    return false;
  }
  let units = ['pcs', 'kg', 'box'];
  unit = unit.toLowerCase();
  if (!units.includes(unit)) {
    document.querySelector(`.errorMes-unit`).innerHTML = `Product unit should be pcs or kg or box`;
    return false;
  }
  return true;
}

//* Validation Functions for categories
export function isVaildCategoryData(data) {
  //^ remove all old error messages
  document.querySelectorAll('.errorMes').forEach(item => item.innerHTML = '');

  const v1 = isVaildName(data.name);
  const v2 = isVaildDescription(data.description);
  return v1 && v2;
}
function isVaildDescription(description) {
  if (description.length === 0) {
    document.querySelector('.errorMes-description').innerHTML = `Product description is required`;
    return false;
  }
  if (description.length <= 10 || description.length > 40) {
    document.querySelector('.errorMes-description').innerHTML = `Product description should be bigger than 10 charchter and less than 40`;
    return false;
  }
  return true;
}

//* Validation Functions for suppliers
export function isVaildSupplierData(data) {
  //^ remove all old error messages
  document.querySelectorAll('.errorMes').forEach(item => item.innerHTML = '');

  const v1 = isVaildName(data.name);
  const v2 = isVaildContact(data.contact, data);
  const v3 = isValidEmail(data.email);
  const v4 = isValidPhone(data.phone);
  const v5 = isVaildAddress(data.address);
  return v1 && v2 && v3 && v4 && v5;
}
function isVaildContact(fullName, data) {
  if (fullName.length === 0) {
    document.querySelector('.errorMes-contact').innerHTML = `Contact Person is required`;
    return false;
  }
  fullName = fullName.toLowerCase().trim().split(' ');
  if (fullName.length !== 2) {
    document.querySelector('.errorMes-contact').innerHTML = `Contact Person is full name with only two word`;
    return false;
  }
  const regex = /^[a-z]+$/;
  if (!regex.test(fullName[0]) || !regex.test(fullName[1])) {
    document.querySelector('.errorMes-contact').innerHTML = `each word in full name must include only letters`;
    return false;
  }
  //^ convert input to make first letter in each word capital
  fullName[0] = fullName[0][0].toUpperCase() + fullName[0].slice(1);
  fullName[1] = fullName[1][0].toUpperCase() + fullName[1].slice(1);
  data.contact = fullName.join(' ');
  return true;
}

function isValidEmail(email) {
  if (email.length === 0) {
    document.querySelector('.errorMes-email').innerHTML = `Email is required`;
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.querySelector('.errorMes-contact').innerHTML = `Email must be like this vaild format  something@domain.com`;
    return false;
  }
  return true;
};
function isValidPhone(phone) {
  phone = phone.trim();
  if (phone.length === 0) {
    document.querySelector('.errorMes-phone').innerHTML = `phone is required`;
    return false;
  }
  const phoneRegex = /^\+?[0-9\s]{10,20}$/;
  if (!phoneRegex.test(phone)) {
    document.querySelector('.errorMes-phone').innerHTML = `phone must be with valid format like this +201234567890 or 01234567890`;
    return false;
  }
  return true;
};
function isVaildAddress(address) {
  address = address.trim();
  if (address.length === 0) {
    document.querySelector('.errorMes-address').innerHTML = `Address is required`;
    return false;
  }
  if (address.length < 3 || address.length > 20) {
    document.querySelector('.errorMes-address').innerHTML = `Address should have between 3 to 20 characters`;
    return false;
  }
  return true;
}



//* Validation Functions for purchase orders
//* Validation Functions for orders
export function isVaildOrderData(data) {
  document.querySelectorAll('.errorMes').forEach(item => item.innerHTML = '');

  const v1 = isVaildSupplier(data.supplierId);
  const v2 = isVaildItems(data.items);
  return v1 && v2;
}

function isVaildSupplier(supplierId) {
  if (!supplierId || supplierId === "") {
    document.querySelector('.errorMes-supplierId').innerHTML = `Supplier is required`;
    return false;
  }
  return true;
}

function isVaildItems(items) {
  if (!items || items.length === 0) {
    document.querySelector('.errorMes-items').innerHTML = `Please add at least one item`;
    return false;
  }
  return true;
}

//* Dashboard & Reports — shared inventory helpers
export function formatEGP(amount) {
  let num = Number(amount || 0);
  return `${num.toLocaleString("en-US")} EGP`;
}

export function getLowStockProducts(products) {
  if (!Array.isArray(products)) return [];
  return products
    .filter((p) => Number(p.quantity) <= Number(p.reorderLevel))
    .sort((a, b) => Number(a.quantity) - Number(b.quantity));
}

export function getInventoryValueRowsSorted(products, limit) {
  const rows = [];
  if (!Array.isArray(products)) return rows;
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

export function getTotalInventoryValue(products) {
  let total = 0;
  if (!Array.isArray(products)) return total;
  for (let i = 0; i < products.length; i++) {
    let p = products[i];
    total += Number(p.price) * Number(p.quantity);
  }
  return total;
}

export function getPendingOrdersCount(orders) {
  let n = 0;
  for (let i = 0; i < orders.length; i++) {
    if (String(orders[i].status).toLowerCase() === "pending") n++;
  }
  return n;
}

//* Activity log — shared with Activity page and Dashboard
export function getActionStyle(action) {
  if (action.includes("STOCK_ADJUSTMENT"))
    return { color: "warning", label: "adjust" };
  if (action.includes("RECEIVE_ORDER"))
    return { color: "primary", label: "order" };
  if (action.includes("CREATE_PURCHASE_ORDER"))
    return { color: "primary", label: "order" };
  if (action.includes("CREATE_PRODUCT"))
    return { color: "success", label: "add" };
  if (action.includes("UPDATE_PRODUCT"))
    return { color: "success", label: "update" };
  if (action.includes("LOW_STOCK_ALERT"))
    return { color: "danger", label: "alert" };
  return { color: "secondary", label: "info" };
}

export function formatActivityTimestamp(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function activityRowHtml(activity) {
  const { color, label } = getActionStyle(activity.action);
  const date = formatActivityTimestamp(activity.timestamp);
  return `
    <div class="d-flex align-items-center justify-content-between py-3 border-bottom">
      <div class="d-flex align-items-start gap-3">
        <span class="mt-1 rounded-circle bg-${color} activity-dot"></span>
        <div>
          <div class="fw-medium">${activity.details}</div>
          <small class="text-muted">${date}</small>
        </div>
      </div>
      <span class="badge rounded-pill bg-${color} bg-opacity-25 
        text-${color} ms-3 text-capitalize fw-normal px-3">
        ${label}
      </span>
    </div>
  `;
}