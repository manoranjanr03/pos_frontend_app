// API Endpoint Constants

// Base URL (from Swagger)
export const BASE_URL = "http://localhost:5000/api/v1";

// Authentication
export const AUTH_REGISTER = "/auth/register";
export const AUTH_LOGIN = "/auth/login";
export const AUTH_ME = "/auth/me";

// Restaurants (Admin)
export const ADMIN_RESTAURANTS = "/admin/restaurants";
export const ADMIN_RESTAURANT_DETAIL = (id: string) =>
  `/admin/restaurants/${id}`;

// Restaurants (Management)
export const MY_RESTAURANT = "/restaurants/my-restaurant";

// Menu Categories
export const MENU_CATEGORIES = "/menu-categories";
export const MENU_CATEGORIES_RESTAURANT = "/menu-categories/restaurant"; // Assuming this gets categories for the logged-in user's restaurant
export const MENU_CATEGORY_DETAIL = (id: string) => `/menu-categories/${id}`;

// Menu Items
export const MENU_ITEMS = "/menu";
export const MENU_ITEMS_RESTAURANT = (restaurantId: string) =>
  `/menu/restaurant/${restaurantId}`; // Needs restaurant ID
export const MENU_ITEM_DETAIL = (id: string) => `/menu/${id}`;

// Customers
export const CUSTOMERS = "/customers";
export const CUSTOMERS_RESTAURANT = "/customers/restaurant"; // Assuming this gets customers for the logged-in user's restaurant
export const CUSTOMER_DETAIL = (id: string) => `/customers/${id}`;
export const CUSTOMER_LOYALTY = (id: string) => `/customers/${id}/loyalty`;

// Orders
export const ORDERS = "/orders";
export const ORDERS_RESTAURANT = "/orders/restaurant"; // Assuming this gets orders for the logged-in user's restaurant
export const ORDER_DETAIL = (id: string) => `/orders/${id}`;
export const ORDER_STATUS = (id: string) => `/orders/${id}/status`;
export const ORDER_PAYMENT = (id: string) => `/orders/${id}/payment`; // Requires RecordPaymentDto, not defined in provided swagger snippet
export const ORDER_KOT = (id: string) => `/orders/${id}/kot`;

// Feedback
export const FEEDBACK = "/feedback";
export const FEEDBACK_RESTAURANT = "/feedback/restaurant"; // Assuming this gets feedback for the logged-in user's restaurant
export const FEEDBACK_DETAIL = (id: string) => `/feedback/${id}`;
export const FEEDBACK_STATUS = (id: string) => `/feedback/${id}/status`;

// Inventory Items
export const INVENTORY_ITEMS = "/inventory";
export const INVENTORY_ITEMS_RESTAURANT = (restaurantId: string) =>
  `/inventory/restaurant/${restaurantId}`; // Needs restaurant ID
export const INVENTORY_ITEM_DETAIL = (id: string) => `/inventory/${id}`;
export const INVENTORY_ITEM_STOCK = (id: string) => `/inventory/${id}/stock`;

// Users (Restaurant User Management)
export const RESTAURANT_USERS = "/users/restaurant"; // Create/Get users for the admin's restaurant
export const RESTAURANT_USER_DETAIL = (id: string) => `/users/restaurant/${id}`;

// Transactions
export const TRANSACTIONS_ORDER = (orderId: string) =>
  `/transactions/order/${orderId}`;
export const TRANSACTION_DETAIL = (id: string) => `/transactions/${id}`;

// Other (Less common for basic CRUD admin)
// export const TABLES = '/tables';
// export const TABLES_RESTAURANT = '/tables/restaurant';
// export const TABLE_DETAIL = (id: string) => `/tables/${id}`;
// export const RECIPES = '/recipes';
// export const RECIPE_MENU_ITEM = (menuItemId: string) => `/recipes/menu-item/${menuItemId}`;
// export const RECIPE_DETAIL = (id: string) => `/recipes/${id}`;
// export const PURCHASES = '/purchases';
// export const PURCHASES_RESTAURANT = '/purchases/restaurant';
// export const PURCHASE_DETAIL = (id: string) => `/purchases/${entryId}`; // Corrected param name
// export const REPORTS_SALES = '/reports/sales-summary';
// export const REPORTS_INVENTORY = '/reports/inventory-usage';
