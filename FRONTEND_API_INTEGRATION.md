# Frontend URLs and API Integration Documentation

This document outlines the main frontend URLs (pages) in the POS application and the backend API endpoints they primarily interact with. The base URL for all API endpoints is `http://localhost:5000/api/v1`.

## I. Authentication

1.  **Frontend URL:** `/` (Root)

    - **Description:** Redirects to `/auth/login`.
    - **API Integration:** None directly.

2.  **Frontend URL:** `/auth/login`

    - **Description:** User login page.
    - **API Integration:**
      - `POST /auth/login` (Function: `loginUser`) - To authenticate the user.
      - On success, stores auth token in `localStorage`.

3.  **Frontend URL:** `/auth/register`

    - **Description:** User registration page.
    - **API Integration:**
      - `POST /auth/register` (Function: `registerUser`) - To create a new user account.

4.  **Frontend URL:** `/auth/admin/login`
    - **Description:** Admin login page.
    - **API Integration:**
      - `POST /auth/login` (Function: `loginUser`) - To authenticate the admin user. (Note: Uses the same endpoint as regular user login; backend differentiates by role).
      - On success, stores auth token in `localStorage`.

## II. Admin Section

1.  **Frontend URL:** `/admin/dashboard`

    - **Description:** Main dashboard for admin users.
    - **API Integration:** (Currently basic, could integrate with various admin-specific summary endpoints in the future)
      - Potentially `GET /admin/restaurants` (Function: `getAdminRestaurants`) if displaying a list of all restaurants.

2.  **Frontend URL (Implied for Admin Restaurant Management):** `/admin/restaurants/*` (e.g., list, create, edit, view specific restaurant)
    - **Description:** Pages for admins to manage all restaurants in the system.
    - **API Integration (based on `lib/fetchers.ts` for admin restaurant functions):**
      - `GET /admin/restaurants` (Function: `getAdminRestaurants`) - To list all restaurants.
      - `GET /admin/restaurants/{restaurantId}` (Function: `getAdminRestaurantById`) - To view a specific restaurant.
      - `POST /admin/restaurants` (Function: `createAdminRestaurant`) - To create a new restaurant.
      - `PATCH /admin/restaurants/{restaurantId}` (Function: `updateAdminRestaurant`) - To update a restaurant.
      - `DELETE /admin/restaurants/{restaurantId}` (Function: `deleteAdminRestaurant`) - To delete a restaurant.

## III. Restaurant Management (for Logged-in Restaurant Owners/Managers)

1.  **Frontend URL:** `/restaurants`

    - **Description:** Displays details of the logged-in user's restaurant. Redirects to `/restaurants/create` if no restaurant is associated.
    - **API Integration:**
      - `GET /restaurants/my-restaurant` (Function: `getMyRestaurant`) - To fetch the current user's restaurant details.

2.  **Frontend URL:** `/restaurants/create`

    - **Description:** Page to create a new restaurant for the logged-in user.
    - **API Integration:**
      - Likely uses an endpoint similar to `POST /admin/restaurants` but scoped to the user, or a dedicated `POST /restaurants/my-restaurant` or `POST /restaurants` if the backend supports user-driven creation. The current `fetchers.ts` focuses on `getMyRestaurant` and `updateMyRestaurant`. Creation might be handled by an admin or a different flow not yet fully implemented in `fetchers.ts` for non-admin users. _Correction: Restaurant creation for a user is typically part of an onboarding or a specific "create my restaurant" flow. The `getMyRestaurant` implies existence. If a user can create their own, it would likely be a `POST` to `/restaurants/my-restaurant` or a general `/restaurants` endpoint that associates with the logged-in user._

3.  **Frontend URL:** `/restaurants/edit`

    - **Description:** Page to edit the logged-in user's existing restaurant.
    - **API Integration:**
      - `GET /restaurants/my-restaurant` (Function: `getMyRestaurant`) - To pre-fill form with existing data.
      - `PATCH /restaurants/my-restaurant` (Function: `updateMyRestaurant`) - To update the restaurant details.

4.  **Frontend URL (Dynamic):** `/restaurants/[id]` and `/restaurants/[id]/edit`
    - **Description:** These routes seem to be placeholders or for a different listing/detail view (perhaps if a user could manage multiple restaurants or view public ones). The primary flow for a single restaurant owner is `/restaurants` and `/restaurants/edit`.
    - **API Integration:** If used, would likely map to:
      - `GET /admin/restaurants/{id}` (if viewing any restaurant by ID, potentially for admins or a public view)
      - `PATCH /admin/restaurants/{id}` (if editing any restaurant by ID, admin context)

## IV. Menu Categories

1.  **Frontend URL:** `/menu-categories`

    - **Description:** List menu categories for the user's restaurant.
    - **API Integration:**
      - `GET /menu-categories/restaurant` (Function: `getMenuCategories`) - Requires `restaurantId` (likely fetched via `getMyRestaurant` first).

2.  **Frontend URL:** `/menu-categories/create`

    - **Description:** Create a new menu category.
    - **API Integration:**
      - `POST /menu-categories` (Function: `createMenuCategory`)

3.  **Frontend URL (Dynamic):** `/menu-categories/[id]`

    - **Description:** View details of a specific menu category.
    - **API Integration:**
      - `GET /menu-categories/{id}` (Function: `getMenuCategoryById`)

4.  **Frontend URL (Dynamic):** `/menu-categories/[id]/edit`
    - **Description:** Edit a specific menu category.
    - **API Integration:**
      - `GET /menu-categories/{id}` (Function: `getMenuCategoryById`) - To pre-fill form.
      - `PATCH /menu-categories/{id}` (Function: `updateMenuCategory`)
      - `DELETE /menu-categories/{id}` (Function: `deleteMenuCategory`) - Often an option on an edit page or list.

## V. Menu Items

1.  **Frontend URL:** `/menu-items`

    - **Description:** List menu items for the user's restaurant.
    - **API Integration:**
      - `GET /menu/restaurant/{restaurantId}` (Function: `getMenuItems`) - Requires `restaurantId`.

2.  **Frontend URL:** `/menu-items/create`

    - **Description:** Create a new menu item.
    - **API Integration:**
      - `POST /menu` (Function: `createMenuItem`)

3.  **Frontend URL (Dynamic):** `/menu-items/[id]`

    - **Description:** View details of a specific menu item.
    - **API Integration:**
      - `GET /menu/{id}` (Function: `getMenuItemById`)

4.  **Frontend URL (Dynamic):** `/menu-items/[id]/edit`
    - **Description:** Edit a specific menu item.
    - **API Integration:**
      - `GET /menu/{id}` (Function: `getMenuItemById`) - To pre-fill form.
      - `PATCH /menu/{id}` (Function: `updateMenuItem`)
      - `DELETE /menu/{id}` (Function: `deleteMenuItem`)

## VI. Customers

1.  **Frontend URL:** `/customers`

    - **Description:** List customers for the user's restaurant.
    - **API Integration:**
      - `GET /customers/restaurant` (Function: `getCustomers`)

2.  **Frontend URL:** `/customers/create`

    - **Description:** Create a new customer.
    - **API Integration:**
      - `POST /customers` (Function: `createCustomer`)

3.  **Frontend URL (Dynamic):** `/customers/[id]`

    - **Description:** View details of a specific customer.
    - **API Integration:**
      - `GET /customers/{id}` (Function: `getCustomerById`)

4.  **Frontend URL (Dynamic):** `/customers/[id]/edit`
    - **Description:** Edit a specific customer.
    - **API Integration:**
      - `GET /customers/{id}` (Function: `getCustomerById`) - To pre-fill form.
      - `PATCH /customers/{id}` (Function: `updateCustomer`)
      - `DELETE /customers/{id}` (Function: `deleteCustomer`)
      - `POST /customers/{id}/loyalty` (Function: `adjustCustomerLoyalty`) - For loyalty adjustments.

## VII. Orders

1.  **Frontend URL:** `/orders`

    - **Description:** List orders for the user's restaurant.
    - **API Integration:**
      - `GET /orders/restaurant` (Function: `getOrders`) - Can be filtered by `status`.

2.  **Frontend URL:** `/orders/create`

    - **Description:** Create a new order.
    - **API Integration:**
      - `POST /orders` (Function: `createOrder`)

3.  **Frontend URL (Dynamic):** `/orders/[id]`

    - **Description:** View details of a specific order.
    - **API Integration:**
      - `GET /orders/{id}` (Function: `getOrderById`)
      - `GET /orders/{id}/kot` (Function: `getOrderKot`) - To get Kitchen Order Ticket.

4.  **Frontend URL (Dynamic):** `/orders/[id]/edit`
    - **Description:** Edit/Update a specific order (e.g., status, payment).
    - **API Integration:**
      - `GET /orders/{id}` (Function: `getOrderById`) - To pre-fill form.
      - `PATCH /orders/{id}/status` (Function: `updateOrderStatus`)
      - `POST /orders/{id}/payment` (Function: `recordOrderPayment`)

## VIII. Other Potential Integrations (based on `fetchers.ts` but not explicitly mapped to unique page files yet)

- **Feedback:**
  - `GET /feedback/restaurant` (Function: `getFeedback`)
  - `POST /feedback` (Function: `createFeedback`)
  - `GET /feedback/{feedbackId}` (Function: `getFeedbackById`)
  - `PATCH /feedback/{feedbackId}/status` (Function: `updateFeedbackStatus`)
- **Inventory Items:**
  - `GET /inventory/restaurant/{restaurantId}` (Function: `getInventoryItems`)
  - `POST /inventory` (Function: `createInventoryItem`)
  - `GET /inventory/{itemId}` (Function: `getInventoryItemById`)
  - `PATCH /inventory/{itemId}` (Function: `updateInventoryItem`)
  - `DELETE /inventory/{itemId}` (Function: `deleteInventoryItem`)
  - `POST /inventory/{itemId}/stock` (Function: `adjustInventoryStock`)
- **Restaurant Users (Staff Management by Admin/Owner):**
  - `GET /users/restaurant` (Function: `getRestaurantUsers`)
  - `POST /users/restaurant` (Function: `createRestaurantUser`)
  - `GET /users/restaurant/{userId}` (Function: `getRestaurantUserById`)
  - `PATCH /users/restaurant/{userId}` (Function: `updateRestaurantUser`)
  - `DELETE /users/restaurant/{userId}` (Function: `deleteRestaurantUser`)
- **Transactions:**
  - `GET /transactions/order/{orderId}` (Function: `getTransactionsByOrder`)
  - `GET /transactions/{transactionId}` (Function: `getTransactionById`)

This document provides a mapping based on the current project structure and API fetcher functions. Specific UI components on each page will determine the exact API calls made during user interaction.
