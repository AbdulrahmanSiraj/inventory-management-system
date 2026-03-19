export default function renderTable(data, cols, actions = true) {
    if (!data || data.length === 0) {
      return '<p class="text-center text-muted">No data available</p>';
    }
    let table = `
    <div class="table-responsive">
    <table class="table table-hover align-middle">
        <thead>
            <tr>
    `;
    cols.forEach((col) => {
      table += `<th>${col.toUpperCase()}</th>`;
    });
    if (actions) {
      table += `<th>Actions</th>`;
    }
    table += `
              </tr>
              </thead>
              <tbody>`;
    data.forEach((item) => {
      table += `<tr>`;
      cols.forEach((col) => {
        let value = item[col];
        table += `<td>${value || "-"}</td>`;
      });
  
      if (actions) {
        table += `
                <td>
                  <button class="action-btn edit-btn" onclick="handleEdit(${item.id})"><i class="bi bi-pencil"></i></button>
                  <button class="action-btn delete-btn" onclick="handleDelete(${item.id})"><i class="bi bi-trash"></i></button>
                </td>
              `;
      }
  
      table += `</tr>`;
    });
    table += `
          </tbody>
        </table>
      </div>
    `;
    return table;
  }
  