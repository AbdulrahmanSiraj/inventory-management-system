export default function renderPagination(totalItems, currentPage, pageSize) {
  const totalPages = Math.ceil(totalItems / pageSize);

  let pages = "";
  for (let i = 1; i <= totalPages; i++) {
    pages += `
        <li class="page-item ${i === currentPage ? "active" : ""}">
          <button class="page-link" data-page="${i}">${i}</button>
        </li>`;
  }

  return `
      <div class="d-flex justify-content-between align-items-center m-4">
        <div class="d-flex align-items-center gap-3">
          <small class="text-muted text-nowrap">Rows per page:</small>
          <select class="form-select form-select-sm border-0 shadow-none page-size-select">
            ${[5, 10, 25, 50]
              .map(
                (n) => `
              <option value="${n}" ${n === pageSize ? "selected" : ""}>${n}</option>
            `,
              )
              .join("")}
          </select>
          <small class="text-muted text-nowrap">
            ${Math.min((currentPage - 1) * pageSize + 1, totalItems)}–${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}
          </small>
        </div>
  
        ${
          totalPages > 1
            ? `
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <button class="page-link" data-page="${currentPage - 1}">‹</button>
          </li>
          ${pages}
          <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <button class="page-link" data-page="${currentPage + 1}">›</button>
          </li>
        </ul>`
            : ""
        }
      </div>`;
}
export function paginateData(data, currentPage, pageSize = 10) {
  const start = (currentPage - 1) * pageSize;
  return data.slice(start, start + pageSize);
}
