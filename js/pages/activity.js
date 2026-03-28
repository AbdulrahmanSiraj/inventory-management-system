import { fetchData } from "../services/api.js";
import renderPagination, { paginateData } from "../components/pagination.js";
import { activityRowHtml } from "../utils/helpers.js";

let activities = [];
let lastFiltered = [];
let currentPage = 1;
let PAGE_SIZE = 5;

export async function loadActivityLog() {
  await loadData();
  lastFiltered = [...activities];
  renderActivities();
  setupEventListeners();
}

async function loadData() {
  //^ get activity data
  activities = await fetchData("activityLog");
  //^ sort them by newest first based on data to make it by default sorted
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

//* build the rows section with pagination applied
function getActivityListHtml(data = lastFiltered) {
  const paginated = paginateData(data, currentPage, PAGE_SIZE);
  const rows = paginated.map(activityRowHtml).join("");
  const list = rows
    ? rows
    : '<p class="text-muted text-center py-3">No activity found.</p>';

  return `
    <div id="activityList">
      ${list}
    </div>
    ${renderPagination(data.length, currentPage, PAGE_SIZE)}
  `;
}

//* build the full page
function renderActivities() {
  const html = `
    <!-- Filter bar -->
    <div class="d-flex gap-2 mb-3 align-items-center p-3 bg-white rounded border">
      <i class="bi bi-search text-muted"></i>
      <input type="text" id="searchActivity" placeholder="Search activity..."
        class="form-control form-control-sm border-0 shadow-none">
      <select id="typeFilter" class="form-select form-select-sm border-0 shadow-none form-select-activity-type">
        <option value="">All Types</option>
        <option value="STOCK_ADJUSTMENT">Adjustments</option>
        <option value="RECEIVE_ORDER">Orders Received</option>
        <option value="CREATE_PRODUCT">Products Added</option>
        <option value="UPDATE_PRODUCT">Products Updated</option>
        <option value="LOW_STOCK_ALERT">Low Stock Alerts</option>
        <option value="CREATE_PURCHASE_ORDER">Purchase Orders</option>
      </select>
    </div>

    <div id="searchStats" class="mb-2 small text-muted px-1"></div>

    <!-- Activity card with list + pagination inside -->
    <div class="bg-white rounded border p-4" id="activityContainer">
      <h6 class="fw-bold mb-3">All Activity</h6>
      <div id="activityContent">
        ${getActivityListHtml()}
      </div>
    </div>
  `;

  document.getElementById("pageContent").innerHTML = html;
}

//* filter by search text Or type filter
function filterActivities() {
  //^1. get value for search input and filter 
  const searchTerm = document
    .getElementById("searchActivity")
    .value.toLowerCase();
  const typeFilter = document.getElementById("typeFilter").value;
  //^ 2. filter by activities make new filter data based on search input OOOOOR  filter type
  lastFiltered = activities.filter((a) => {
    if (searchTerm && !a.details.toLowerCase().includes(searchTerm))
      return false;
    if (typeFilter && !a.action.includes(typeFilter)) return false;
    return true;
  });

  //^ set current page to one 
  currentPage = 1;
  //^ render content in page based on new data filter
  updateActivityContent();
  //^ render new status 
  updateStats();
}

//* re-render only the list + pagination
function updateActivityContent() {
  document.getElementById("activityContent").innerHTML =
    getActivityListHtml();
}
//* if user made any search with input search or filter then we will show to him number of found it element 
function updateStats() {
  const statsDiv = document.getElementById("searchStats");
  if (!statsDiv) return;
  const search = document.getElementById("searchActivity").value;
  const type = document.getElementById("typeFilter").value;
  statsDiv.innerHTML =
    search || type
      ? `Found ${lastFiltered.length} activit${lastFiltered.length !== 1 ? "ies" : "y"}`
      : "";
}

function setupEventListeners() {
  //* 1. search 
  document
    .getElementById("searchActivity")
    ?.addEventListener("input", filterActivities);

  //* 2. filter
  document
    .getElementById("typeFilter")
    ?.addEventListener("change", filterActivities);

  //* 3. pagination and page size — event delegation on pageContent
  document
    .getElementById("pageContent")
    .addEventListener("click", function (e) {
      const pageBtn = e.target.closest(".page-link");
      if (pageBtn) {
        const page = Number(pageBtn.dataset.page);
        const totalPages = Math.ceil(lastFiltered.length / PAGE_SIZE);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        updateActivityContent();
      }
    });

  document
    .getElementById("pageContent")
    .addEventListener("change", function (e) {
      const pageSizeSelect = e.target.closest(".page-size-select");
      if (pageSizeSelect) {
        PAGE_SIZE = Number(pageSizeSelect.value);
        currentPage = 1;
        updateActivityContent();
      }
    });
}