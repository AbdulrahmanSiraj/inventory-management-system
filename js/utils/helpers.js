//* Validation Functions for Products 
export function isVaildProductData(data,id){
  //^ remove all old error messages
  document.querySelectorAll('.errorMes').forEach(item => item.innerHTML = '');
  
  const v1 = isVaildName(data.name);
  const v2 = isVaildSku(data.sku, id); 
  const v3 = isVaildNumber(data.price, 'price');
  const v4 = isVaildNumber(data.quantity, 'quantity');
  const v5 = isVaildNumber(data.reorderLevel, 'reorderLevel');
  const v6 = isVaildUnit(data.unit);
  return v1 && v2 && v3 && v4&&v5&&v6;
} 
function isVaildName(name){
  if(name.length===0){
    document.querySelector('.errorMes-name').innerHTML=`Product Name is required`;
    return false;
  }
  if(name.length<=3||name.length>25){
    document.querySelector('.errorMes-name').innerHTML=`Product Name should be bigger than 3 charchter and less than 25`;
    return false;
  }
  return true;
}
function isVaildSku(sku){
  //^ if empty
  if(sku.length===0){
    document.querySelector('.errorMes-sku').innerHTML=`Product SKU is required`;
    return false;
  }
  //^ if not vaild format LETTERS-3Digit of number> ABC-123
  const skuRegex = /^[A-Z]+-\d{3}$/;
  if (!skuRegex.test(sku)) {
    document.querySelector('.errorMes-sku').innerHTML="Invalid SKU format. Please use 'LETTERS-000'.";
    return false;
  }
  return true;
}
function isVaildNumber(num,type){
  if(num.length===0){
    document.querySelector(`.errorMes-${type}`).innerHTML=`Product ${type} is required`;
    return false;
  }
  num = Number(num);
  if(num<=0){
    document.querySelector(`.errorMes-${type}`).innerHTML=`Product ${type} should be bigger than zero`;
    return false;
  }
  return true;
}
function isVaildUnit(unit){
  if(unit.length===0){
    document.querySelector(`.errorMes-unit`).innerHTML=`Product unit is required`;
    return false;
  }
  let units = ['pcs','kg','box'];
  unit=unit.toLowerCase();
  if(!units.includes(unit)){
    document.querySelector(`.errorMes-unit`).innerHTML=`Product unit should be pcs or kg or box`;
    return false;
  }
  return true;
}

//* Validation Functions for categories
export function isVaildCategoryData(data){
  //^ remove all old error messages
  document.querySelectorAll('.errorMes').forEach(item => item.innerHTML = '');
  
  const v1 = isVaildName(data.name);
  const v2 = isVaildDescription(data.description); 
  return v1 && v2 ;
}
function isVaildDescription(description){
  if(description.length===0){
    document.querySelector('.errorMes-description').innerHTML=`Product description is required`;
    return false;
  }
  if(description.length<=10||description.length>40){
    document.querySelector('.errorMes-description').innerHTML=`Product description should be bigger than 10 charchter and less than 40`;
    return false;
  }
  return true;
}

//* Validation Functions for suppliers
export function isVaildSupplierData(data){
  //^ remove all old error messages
  document.querySelectorAll('.errorMes').forEach(item => item.innerHTML = '');
  
  const v1 = isVaildName(data.name);
  const v2 = isVaildContact(data.contact,data); 
  const v3 = isValidEmail(data.email);
  const v4 = isValidPhone(data.phone);
  const v5 = isVaildAddress(data.address);
  return v1 && v2 && v3 && v4 &&v5;
}
function isVaildContact(fullName,data){
  if(fullName.length===0){
    document.querySelector('.errorMes-contact').innerHTML=`Contact Person is required`;
    return false;
  }
  fullName=fullName.toLowerCase().trim().split(' ');
  if(fullName.length !==2 ){
    document.querySelector('.errorMes-contact').innerHTML=`Contact Person is full name with only two word`;
    return false;
  }
  const regex = /^[a-z]+$/;
  if(!regex.test(fullName[0]) || !regex.test(fullName[1])){
    document.querySelector('.errorMes-contact').innerHTML=`each word in full name must include only letters`;
    return false;
  }
  //^ convert input to make first letter in each word capital
  fullName[0]= fullName[0][0].toUpperCase()+fullName[0].slice(1);
  fullName[1]= fullName[1][0].toUpperCase()+fullName[1].slice(1);
  data.contact = fullName.join(' ');
  return true;
}

function isValidEmail (email) {
  if(email.length===0){
    document.querySelector('.errorMes-email').innerHTML=`Email is required`;
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){
    document.querySelector('.errorMes-contact').innerHTML=`Email must be like this vaild format  something@domain.com`;
    return false;
  }
  return true;
};
function isValidPhone (phone) {
  phone = phone.trim();
  if(phone.length===0){
    document.querySelector('.errorMes-phone').innerHTML=`phone is required`;
    return false;
  }
  const phoneRegex = /^\+?[0-9\s]{10,20}$/;
  if(!phoneRegex.test(phone)){
    document.querySelector('.errorMes-phone').innerHTML=`phone must be with valid format like this +201234567890 or 01234567890`;
    return false;
  }
  return true;
};
function isVaildAddress(address){
  address = address.trim();
  if(address.length===0){
    document.querySelector('.errorMes-address').innerHTML=`Address is required`;
    return false;
  }
  if(address.length<3 || address.length>20){
    document.querySelector('.errorMes-address').innerHTML=`Address should have between 3 to 20 characters`;
    return false;
  }
  return true;
}