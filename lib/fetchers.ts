import api from "./api";
import * as EP from "./endpoints";
import type { paths, components } from "../types/swagger"; // Import generated types

// Define helper types for request bodies and responses based on paths
type LoginCredentials =
  paths[typeof EP.AUTH_LOGIN]["post"]["requestBody"]["content"]["application/json"];
type LoginResponse =
  paths[typeof EP.AUTH_LOGIN]["post"]["responses"]["200"]["content"]["application/json"];

type RegisterUserData =
  paths[typeof EP.AUTH_REGISTER]["post"]["requestBody"]["content"]["application/json"];
type RegisterResponse =
  paths[typeof EP.AUTH_REGISTER]["post"]["responses"]["201"]["content"]["application/json"];

type CurrentUserResponse =
  paths[typeof EP.AUTH_ME]["get"]["responses"]["200"]["content"]["application/json"];

type AdminRestaurantsResponse =
  paths[typeof EP.ADMIN_RESTAURANTS]["get"]["responses"]["200"]["content"]["application/json"];
type AdminRestaurantDetailResponse =
  paths["/admin/restaurants/{restaurantId}"]["get"]["responses"]["200"]["content"]["application/json"];
type AdminCreateRestaurantData =
  paths[typeof EP.ADMIN_RESTAURANTS]["post"]["requestBody"]["content"]["application/json"];
type AdminCreateRestaurantResponse =
  paths[typeof EP.ADMIN_RESTAURANTS]["post"]["responses"]["201"]["content"]["application/json"];
// Correctly define type for PATCH payload based on its specific schema in swagger.d.ts
type AdminUpdateRestaurantData =
  paths["/admin/restaurants/{restaurantId}"]["patch"]["requestBody"]["content"]["application/json"];
type AdminUpdateRestaurantResponse =
  paths["/admin/restaurants/{restaurantId}"]["patch"]["responses"]["200"]["content"]["application/json"];

type MyRestaurantResponse =
  paths[typeof EP.MY_RESTAURANT]["get"]["responses"]["200"]["content"]["application/json"];
type UpdateMyRestaurantData =
  paths[typeof EP.MY_RESTAURANT]["patch"]["requestBody"]["content"]["application/json"];
type UpdateMyRestaurantResponse =
  paths[typeof EP.MY_RESTAURANT]["patch"]["responses"]["200"]["content"]["application/json"];

// --- Authentication Fetchers ---

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(EP.AUTH_LOGIN, credentials);
  // Store token on successful login (client-side only)
  if (typeof window !== "undefined" && response.data.token) {
    localStorage.setItem("authToken", response.data.token);
  }
  return response.data;
};

export const registerUser = async (
  userData: RegisterUserData
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(EP.AUTH_REGISTER, userData);
  return response.data;
};

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await api.get<CurrentUserResponse>(EP.AUTH_ME);
  return response.data;
};

export const logoutUser = () => {
  // Client-side only
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    // Optionally redirect or update UI state
  }
};

// --- Admin Restaurant Fetchers ---

export const getAdminRestaurants =
  async (): Promise<AdminRestaurantsResponse> => {
    const response = await api.get<AdminRestaurantsResponse>(
      EP.ADMIN_RESTAURANTS
    );
    return response.data;
  };

export const getAdminRestaurantById = async (
  id: string
): Promise<AdminRestaurantDetailResponse> => {
  const response = await api.get<AdminRestaurantDetailResponse>(
    EP.ADMIN_RESTAURANT_DETAIL(id)
  );
  return response.data;
};

export const createAdminRestaurant = async (
  data: AdminCreateRestaurantData
): Promise<AdminCreateRestaurantResponse> => {
  const response = await api.post<AdminCreateRestaurantResponse>(
    EP.ADMIN_RESTAURANTS,
    data
  );
  return response.data;
};

export const updateAdminRestaurant = async (
  id: string,
  data: AdminUpdateRestaurantData
): Promise<AdminUpdateRestaurantResponse> => {
  const response = await api.patch<AdminUpdateRestaurantResponse>(
    EP.ADMIN_RESTAURANT_DETAIL(id),
    data
  );
  return response.data;
};

export const deleteAdminRestaurant = async (id: string): Promise<void> => {
  await api.delete(EP.ADMIN_RESTAURANT_DETAIL(id));
};

// --- Restaurant Management Fetchers ---

export const getMyRestaurant = async (): Promise<MyRestaurantResponse> => {
  const response = await api.get<MyRestaurantResponse>(EP.MY_RESTAURANT);
  return response.data;
};

export const updateMyRestaurant = async (
  data: UpdateMyRestaurantData
): Promise<UpdateMyRestaurantResponse> => {
  const response = await api.patch<UpdateMyRestaurantResponse>(
    EP.MY_RESTAURANT,
    data
  );
  return response.data;
};

// --- Menu Category Types ---
type MenuCategoriesResponse =
  paths["/menu-categories/restaurant"]["get"]["responses"]["200"]["content"]["application/json"];
type MenuCategoryDetailResponse =
  paths["/menu-categories/{categoryId}"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateMenuCategoryData =
  paths["/menu-categories"]["post"]["requestBody"]["content"]["application/json"];
type CreateMenuCategoryResponse =
  paths["/menu-categories"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateMenuCategoryData =
  paths["/menu-categories/{categoryId}"]["patch"]["requestBody"]["content"]["application/json"];
type UpdateMenuCategoryResponse =
  paths["/menu-categories/{categoryId}"]["patch"]["responses"]["200"]["content"]["application/json"];

// --- Menu Item Types ---
type MenuItemsResponse =
  paths["/menu/restaurant/{restaurantId}"]["get"]["responses"]["200"]["content"]["application/json"];
type MenuItemDetailResponse =
  paths["/menu/{itemId}"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateMenuItemData =
  paths["/menu"]["post"]["requestBody"]["content"]["application/json"];
type CreateMenuItemResponse =
  paths["/menu"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateMenuItemData =
  paths["/menu/{itemId}"]["patch"]["requestBody"]["content"]["application/json"];
type UpdateMenuItemResponse =
  paths["/menu/{itemId}"]["patch"]["responses"]["200"]["content"]["application/json"];

// --- Customer Types ---
type CustomersResponse =
  paths["/customers/restaurant"]["get"]["responses"]["200"]["content"]["application/json"];
type CustomerDetailResponse =
  paths["/customers/{customerId}"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateCustomerData =
  paths["/customers"]["post"]["requestBody"]["content"]["application/json"];
type CreateCustomerResponse =
  paths["/customers"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateCustomerData =
  paths["/customers/{customerId}"]["patch"]["requestBody"]["content"]["application/json"];
type UpdateCustomerResponse =
  paths["/customers/{customerId}"]["patch"]["responses"]["200"]["content"]["application/json"];
// Loyalty adjustment type needs manual definition or schema reference if available
type AdjustLoyaltyData = { pointsChange: number; reason?: string }; // Example based on path description

// --- Order Types ---
type OrdersResponse =
  paths["/orders/restaurant"]["get"]["responses"]["200"]["content"]["application/json"];
type OrderDetailResponse =
  paths["/orders/{orderId}"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateOrderData =
  paths["/orders"]["post"]["requestBody"]["content"]["application/json"];
type CreateOrderResponse =
  paths["/orders"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateOrderStatusData =
  paths["/orders/{orderId}/status"]["patch"]["requestBody"]["content"]["application/json"];
type UpdateOrderStatusResponse =
  paths["/orders/{orderId}/status"]["patch"]["responses"]["200"]["content"]["application/json"];
type RecordPaymentData = components["schemas"]["RecordPaymentDto"]; // Use defined schema
type RecordPaymentResponse =
  paths["/orders/{orderId}/payment"]["post"]["responses"]["200"]["content"]["application/json"];
type OrderKotResponse =
  paths["/orders/{orderId}/kot"]["get"]["responses"]["200"]["content"]["application/json"];

// --- Feedback Types ---
type FeedbackResponse =
  paths["/feedback/restaurant"]["get"]["responses"]["200"]["content"]["application/json"];
type FeedbackDetailResponse =
  paths["/feedback/{feedbackId}"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateFeedbackData =
  paths["/feedback"]["post"]["requestBody"]["content"]["application/json"];
type CreateFeedbackResponse =
  paths["/feedback"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateFeedbackStatusData =
  paths["/feedback/{feedbackId}/status"]["patch"]["requestBody"]["content"]["application/json"];
type UpdateFeedbackStatusResponse =
  paths["/feedback/{feedbackId}/status"]["patch"]["responses"]["200"]["content"]["application/json"];

// --- Inventory Item Types ---
type InventoryItemsResponse =
  paths["/inventory/restaurant/{restaurantId}"]["get"]["responses"]["200"]["content"]["application/json"];
type InventoryItemDetailResponse =
  paths["/inventory/{itemId}"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateInventoryItemData =
  paths["/inventory"]["post"]["requestBody"]["content"]["application/json"];
type CreateInventoryItemResponse =
  paths["/inventory"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateInventoryItemData =
  paths["/inventory/{itemId}"]["patch"]["requestBody"]["content"]["application/json"];
type UpdateInventoryItemResponse =
  paths["/inventory/{itemId}"]["patch"]["responses"]["200"]["content"]["application/json"];
type AdjustStockData =
  paths["/inventory/{itemId}/stock"]["post"]["requestBody"]["content"]["application/json"];
type AdjustStockResponse =
  paths["/inventory/{itemId}/stock"]["post"]["responses"]["200"]["content"]["application/json"];

// --- User (Restaurant User Management) Types ---
type RestaurantUsersResponse =
  paths["/users/restaurant"]["get"]["responses"]["200"]["content"]["application/json"];
type RestaurantUserDetailResponse =
  paths["/users/restaurant/{userId}"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateRestaurantUserData =
  paths["/users/restaurant"]["post"]["requestBody"]["content"]["application/json"];
type CreateRestaurantUserResponse =
  paths["/users/restaurant"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateRestaurantUserData =
  paths["/users/restaurant/{userId}"]["patch"]["requestBody"]["content"]["application/json"];
type UpdateRestaurantUserResponse =
  paths["/users/restaurant/{userId}"]["patch"]["responses"]["200"]["content"]["application/json"];

// --- Transaction Types ---
type TransactionsResponse =
  paths["/transactions/order/{orderId}"]["get"]["responses"]["200"]["content"]["application/json"];
type TransactionDetailResponse =
  paths["/transactions/{transactionId}"]["get"]["responses"]["200"]["content"]["application/json"];

// --- Menu Category Fetchers ---

export const getMenuCategories = async ({
  restaurantId,
}: {
  restaurantId: string;
}): Promise<MenuCategoriesResponse> => {
  const response = await api.get<MenuCategoriesResponse>(
    EP.MENU_CATEGORIES_RESTAURANT,
    { params: { restaurantId } } // Pass restaurantId as a query parameter
  );
  return response.data;
};

export const getMenuCategoryById = async (
  id: string
): Promise<MenuCategoryDetailResponse> => {
  const response = await api.get<MenuCategoryDetailResponse>(
    EP.MENU_CATEGORY_DETAIL(id)
  );
  return response.data;
};

export const createMenuCategory = async (
  data: CreateMenuCategoryData
): Promise<CreateMenuCategoryResponse> => {
  const response = await api.post<CreateMenuCategoryResponse>(
    EP.MENU_CATEGORIES,
    data
  );
  return response.data;
};

export const updateMenuCategory = async (
  id: string,
  data: UpdateMenuCategoryData
): Promise<UpdateMenuCategoryResponse> => {
  const response = await api.patch<UpdateMenuCategoryResponse>(
    EP.MENU_CATEGORY_DETAIL(id),
    data
  );
  return response.data;
};

export const deleteMenuCategory = async (id: string): Promise<void> => {
  await api.delete(EP.MENU_CATEGORY_DETAIL(id));
};

// --- Menu Item Fetchers ---

export const getMenuItems = async (
  restaurantId: string
): Promise<MenuItemsResponse> => {
  const response = await api.get<MenuItemsResponse>(
    EP.MENU_ITEMS_RESTAURANT(restaurantId)
  );
  return response.data;
};

export const getMenuItemById = async (
  id: string
): Promise<MenuItemDetailResponse> => {
  const response = await api.get<MenuItemDetailResponse>(
    EP.MENU_ITEM_DETAIL(id)
  );
  return response.data;
};

export const createMenuItem = async (
  data: CreateMenuItemData
): Promise<CreateMenuItemResponse> => {
  const response = await api.post<CreateMenuItemResponse>(EP.MENU_ITEMS, data);
  return response.data;
};

export const updateMenuItem = async (
  id: string,
  data: UpdateMenuItemData
): Promise<UpdateMenuItemResponse> => {
  const response = await api.patch<UpdateMenuItemResponse>(
    EP.MENU_ITEM_DETAIL(id),
    data
  );
  return response.data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  await api.delete(EP.MENU_ITEM_DETAIL(id));
};

// --- Customer Fetchers ---

export const getCustomers = async (): Promise<CustomersResponse> => {
  const response = await api.get<CustomersResponse>(EP.CUSTOMERS_RESTAURANT);
  return response.data;
};

export const getCustomerById = async (
  id: string
): Promise<CustomerDetailResponse> => {
  const response = await api.get<CustomerDetailResponse>(
    EP.CUSTOMER_DETAIL(id)
  );
  return response.data;
};

export const createCustomer = async (
  data: CreateCustomerData
): Promise<CreateCustomerResponse> => {
  const response = await api.post<CreateCustomerResponse>(EP.CUSTOMERS, data);
  return response.data;
};

export const updateCustomer = async (
  id: string,
  data: UpdateCustomerData
): Promise<UpdateCustomerResponse> => {
  const response = await api.patch<UpdateCustomerResponse>(
    EP.CUSTOMER_DETAIL(id),
    data
  );
  return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(EP.CUSTOMER_DETAIL(id));
};

export const adjustCustomerLoyalty = async (
  id: string,
  data: AdjustLoyaltyData
): Promise<UpdateCustomerResponse> => {
  // Assuming response is updated customer
  const response = await api.post<UpdateCustomerResponse>(
    EP.CUSTOMER_LOYALTY(id),
    data
  );
  return response.data;
};

// --- Order Fetchers ---

export const getOrders = async (status?: string): Promise<OrdersResponse> => {
  const params = status ? { status } : {};
  const response = await api.get<OrdersResponse>(EP.ORDERS_RESTAURANT, {
    params,
  });
  return response.data;
};

export const getOrderById = async (
  id: string
): Promise<OrderDetailResponse> => {
  const response = await api.get<OrderDetailResponse>(EP.ORDER_DETAIL(id));
  return response.data;
};

export const createOrder = async (
  data: CreateOrderData
): Promise<CreateOrderResponse> => {
  const response = await api.post<CreateOrderResponse>(EP.ORDERS, data);
  return response.data;
};

export const updateOrderStatus = async (
  id: string,
  data: UpdateOrderStatusData
): Promise<UpdateOrderStatusResponse> => {
  const response = await api.patch<UpdateOrderStatusResponse>(
    EP.ORDER_STATUS(id),
    data
  );
  return response.data;
};

export const recordOrderPayment = async (
  id: string,
  data: RecordPaymentData
): Promise<RecordPaymentResponse> => {
  const response = await api.post<RecordPaymentResponse>(
    EP.ORDER_PAYMENT(id),
    data
  );
  return response.data;
};

export const getOrderKot = async (id: string): Promise<OrderKotResponse> => {
  const response = await api.get<OrderKotResponse>(EP.ORDER_KOT(id));
  return response.data;
};

// --- Feedback Fetchers ---

export const getFeedback = async (
  isAddressed?: boolean
): Promise<FeedbackResponse> => {
  const params =
    typeof isAddressed === "boolean" ? { is_addressed: isAddressed } : {};
  const response = await api.get<FeedbackResponse>(EP.FEEDBACK_RESTAURANT, {
    params,
  });
  return response.data;
};

export const getFeedbackById = async (
  id: string
): Promise<FeedbackDetailResponse> => {
  const response = await api.get<FeedbackDetailResponse>(
    EP.FEEDBACK_DETAIL(id)
  );
  return response.data;
};

export const createFeedback = async (
  data: CreateFeedbackData
): Promise<CreateFeedbackResponse> => {
  const response = await api.post<CreateFeedbackResponse>(EP.FEEDBACK, data);
  return response.data;
};

export const updateFeedbackStatus = async (
  id: string,
  data: UpdateFeedbackStatusData
): Promise<UpdateFeedbackStatusResponse> => {
  const response = await api.patch<UpdateFeedbackStatusResponse>(
    EP.FEEDBACK_STATUS(id),
    data
  );
  return response.data;
};

// --- Inventory Item Fetchers ---

export const getInventoryItems = async (
  restaurantId: string
): Promise<InventoryItemsResponse> => {
  const response = await api.get<InventoryItemsResponse>(
    EP.INVENTORY_ITEMS_RESTAURANT(restaurantId)
  );
  return response.data;
};

export const getInventoryItemById = async (
  id: string
): Promise<InventoryItemDetailResponse> => {
  const response = await api.get<InventoryItemDetailResponse>(
    EP.INVENTORY_ITEM_DETAIL(id)
  );
  return response.data;
};

export const createInventoryItem = async (
  data: CreateInventoryItemData
): Promise<CreateInventoryItemResponse> => {
  const response = await api.post<CreateInventoryItemResponse>(
    EP.INVENTORY_ITEMS,
    data
  );
  return response.data;
};

export const updateInventoryItem = async (
  id: string,
  data: UpdateInventoryItemData
): Promise<UpdateInventoryItemResponse> => {
  const response = await api.patch<UpdateInventoryItemResponse>(
    EP.INVENTORY_ITEM_DETAIL(id),
    data
  );
  return response.data;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  await api.delete(EP.INVENTORY_ITEM_DETAIL(id));
};

export const adjustInventoryStock = async (
  id: string,
  data: AdjustStockData
): Promise<AdjustStockResponse> => {
  const response = await api.post<AdjustStockResponse>(
    EP.INVENTORY_ITEM_STOCK(id),
    data
  );
  return response.data;
};

// --- User (Restaurant User Management) Fetchers ---

export const getRestaurantUsers =
  async (): Promise<RestaurantUsersResponse> => {
    const response = await api.get<RestaurantUsersResponse>(
      EP.RESTAURANT_USERS
    );
    return response.data;
  };

export const getRestaurantUserById = async (
  id: string
): Promise<RestaurantUserDetailResponse> => {
  const response = await api.get<RestaurantUserDetailResponse>(
    EP.RESTAURANT_USER_DETAIL(id)
  );
  return response.data;
};

export const createRestaurantUser = async (
  data: CreateRestaurantUserData
): Promise<CreateRestaurantUserResponse> => {
  const response = await api.post<CreateRestaurantUserResponse>(
    EP.RESTAURANT_USERS,
    data
  );
  return response.data;
};

export const updateRestaurantUser = async (
  id: string,
  data: UpdateRestaurantUserData
): Promise<UpdateRestaurantUserResponse> => {
  const response = await api.patch<UpdateRestaurantUserResponse>(
    EP.RESTAURANT_USER_DETAIL(id),
    data
  );
  return response.data;
};

export const deleteRestaurantUser = async (id: string): Promise<void> => {
  await api.delete(EP.RESTAURANT_USER_DETAIL(id));
};

// --- Transaction Fetchers ---

export const getTransactionsByOrder = async (
  orderId: string
): Promise<TransactionsResponse> => {
  const response = await api.get<TransactionsResponse>(
    EP.TRANSACTIONS_ORDER(orderId)
  );
  return response.data;
};

export const getTransactionById = async (
  id: string
): Promise<TransactionDetailResponse> => {
  const response = await api.get<TransactionDetailResponse>(
    EP.TRANSACTION_DETAIL(id)
  );
  return response.data;
};
