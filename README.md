# 📦 Inventory Management System

> A responsive web application for managing products, suppliers, and inventory — built for small businesses that need clarity and control over their stock.

---

## 🧩 What is StockIQ?

Our project helps small businesses track their inventory, manage suppliers, handle purchase orders, and monitor stock levels — with real-time low stock alerts and a clean, intuitive interface.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure and content |
| CSS3 | Custom styling |
| Bootstrap 5 | Responsive layout and components |
| JavaScript ES6+ | Application logic and interactivity |
| JSON Server | Mock REST API for development |

---

## ✨ Features

- 📦 **Product Management** — Add, edit, delete, and view products
- 🏷️ **Categories & Suppliers** — Manage product categories and supplier info
- 📊 **Inventory Tracking** — Maintain quantities with visual stock indicators
- 🛒 **Purchase Orders** — Create orders and receive stock
- 🔄 **Stock Adjustments** — Adjust quantities with reason tracking
- 📈 **Reports** — Low stock and inventory value reports
- 📋 **Activity Log** — Track all important actions
- 🚨 **Low Stock Alerts** — Visual warnings when stock falls below reorder level
- 📱 **Responsive UI** — Works seamlessly on desktop and mobile

---

## 📁 Project Structure

```
inventory-management-system/
│
├── index.html                  # Main entry point
├── style.css                   # Global styles
├── package.json                # Dependencies
├── README.md
│
├── 📁 data/
│   └── db.json                 # JSON Server database
│
├── 📁 assets/
│   └── images/
│
└── 📁 js/
    ├── main.js                 # App entry: routing & initialization
    │
    ├── 📁 services/
    │   ├── api.js              # Generic fetch wrapper (GET, POST, PUT, DELETE)
    │   └── data.service.js     # Specific methods per entity
    │
    ├── 📁 utils/
    │   ├── helpers.js          # formatMoney, generateSKU, etc.
    │   ├── constants.js        # API_URL, status constants
    │   └── alerts.js           # Toast/notification system
    │
    ├── 📁 components/
    │   ├── table.js            # Dynamic table generator
    │   ├── modal.js            # Popup modal handler
    │   └── form.js             # Dynamic form builder
    │
    └── 📁 pages/
        ├── dashboard.js        # Overview with stats and alerts
        ├── products.js         # Product management with search/filter
        ├── categories.js       # Category management
        ├── suppliers.js        # Supplier contact management
        ├── orders.js           # Purchase order handling
        ├── inventory.js        # Stock adjustments
        ├── reports.js          # Low stock and value reports
        └── activity.js         # Audit log
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AbdulrahmanSiraj/inventory-management-system.git
cd inventory-management-system

# 2. Install dependencies
npm install

# 3. Start JSON Server
npx json-server --watch data/db.json --port 3000

# 4. Open index.html in your browser
```

---

## 👥 Team

| Role | Name |
|---|---|
| 👑 Team Leader | Abdulrahman Siraj El-deen |
| 👩‍💻 Member | Sohaila Hesham |
| 👨‍💻 Member | Ammar Fayez |
| 👨‍💻 Member | Omar Alsheikh |

---

<p align="center">Made with ❤️</p>
