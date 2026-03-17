# Inventory Management System

A responsive web application for managing products, suppliers, and inventory.

## Technologies
HTML
CSS
Bootstrap
JavaScript
jQuery

## Features
Product CRUD
Categories and suppliers
Purchase orders
Stock adjustments
Reports
Low stock alerts

## Folder Structure
├── index.html                  # Main entry point (loads main.js)
├── style.css                   # Global styles & component variables
├── package.json
├── README.md
│
├── 📁 data/
│   └── db.json                 # Your "Database" source
│
├── 📁 assets/
│   └── images/                 # Product icons, logos, etc.
│
└── 📁 js/
    ├── main.js                 # App entry: handles routing & initialization
    │
    ├── 📁 services/            # Data fetching & API logic
    │   ├── api.js              # Generic Fetch/Axios wrapper (GET, POST, etc.)
    │   └── data.service.js     # Specific methods (getProducts, updateStock)
    │
    ├── 📁 utils/               # Independent helper functions
    │   ├── helpers.js          # formatMoney, generateSKU
    │   ├── constants.js        # API_URL, APP_NAME
    │   └── alerts.js           # Toast/Notification logic
    │
    ├── 📁 components/          # Reusable UI "Bricks" (No specific data)
    │   ├── table.js            # Generates <table> from any array
    │   ├── modal.js            # Handles opening/closing popups
    │   └── form.js             # Generates dynamic <form> inputs
    │
    └── 📁 pages/               # The "Glue" (Feature-specific logic)
        ├── dashboard.js        # Logic for the overview screen
        ├── products.js         # Logic for the products table & search
        ├── categories.js       # Logic for category management
        ├── suppliers.js        # Logic for supplier contact list
        ├── orders.js           # Logic for sales/purchase orders
        ├── inventory.js        # Logic for stock levels
        ├── reports.js          # Logic for charts & data exports
        └── activity.js         # Logic for the audit log

## Team
Team Leader: Your Name
Members:
Member 1
Member 2
Member 3