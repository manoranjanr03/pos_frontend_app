import axios from "axios";
import { BASE_URL } from "./endpoints";

// Import types from swagger.d.ts
import type { components, paths } from "@/types/swagger"; // Added paths
type RestaurantInput = components["schemas"]["RestaurantInput"];
type Restaurant = components["schemas"]["Restaurant"];
type User = components["schemas"]["User"];
// Type for creating a user within a specific restaurant (manager/staff)
// This is the request body for POST /users/restaurant as per swagger
type CreateRestaurantUserPayload =
  paths["/users/restaurant"]["post"]["requestBody"]["content"]["application/json"];
// Type for updating a user within a specific restaurant
// This is the request body for PATCH /users/restaurant/{userId}
type UpdateRestaurantUserPayload =
  paths["/users/restaurant/{userId}"]["patch"]["requestBody"]["content"]["application/json"];

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    // Check if running on the client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor to handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - redirecting to login");
      // Check if running on the client side before redirecting
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken"); // Clear expired token
        // Redirect to login page - adjust path as needed
        // window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Creates a new restaurant (Super Admin only).
 * @param data The restaurant data matching RestaurantInput schema.
 * @returns The created restaurant data.
 */
export const createAdminRestaurant = async (
  data: RestaurantInput
): Promise<Restaurant> => {
  try {
    const response = await api.post<{ data?: { restaurant?: Restaurant } }>(
      "/admin/restaurants",
      data
    );
    if (response.data && response.data.data && response.data.data.restaurant) {
      return response.data.data.restaurant;
    }
    throw new Error("Restaurant data not found in response");
  } catch (error) {
    console.error("Failed to create admin restaurant:", error);
    // Consider re-throwing a more specific error or handling it as per application needs
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `API Error (${error.response.status}): ${
          error.response.data?.message || error.message
        }`
      );
    }
    throw error; // Re-throw original error if not an Axios error or no response
  }
};

// --- Restaurant User (Admin/Manager) Management ---
// Note: The following API endpoints might need to be adjusted for a Super Admin context
// e.g., /admin/restaurants/{restaurantId}/users instead of /users/restaurant

/**
 * Fetches users for a specific restaurant.
 * Super admin context: Assumes an endpoint like /admin/restaurants/{restaurantId}/users
 * @param restaurantId The ID of the restaurant.
 */
export const getRestaurantUsers = async (
  restaurantId: string
): Promise<User[]> => {
  try {
    // TODO: Verify actual super admin endpoint. Using placeholder.
    const response = await api.get<{ data?: { users?: User[] } }>(
      `/admin/restaurants/${restaurantId}/users` // Placeholder endpoint
    );
    return response.data?.data?.users || [];
  } catch (error) {
    console.error(
      `Failed to fetch users for restaurant ${restaurantId}:`,
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `API Error (${error.response.status}): ${
          error.response.data?.message || error.message
        }`
      );
    }
    throw error;
  }
};

/**
 * Creates a new user (manager/staff) for a specific restaurant.
 * Super admin context: Assumes an endpoint like /admin/restaurants/{restaurantId}/users
 * @param restaurantId The ID of the restaurant.
 * @param userData The data for the new user.
 */
export const createRestaurantUser = async (
  restaurantId: string,
  userData: CreateRestaurantUserPayload
): Promise<User> => {
  try {
    // TODO: Verify actual super admin endpoint. Using placeholder.
    // The CreateRestaurantUserPayload might implicitly assume restaurant_id from context.
    // For a super admin, ensure the backend handles restaurant_id association correctly if passed in URL.
    const response = await api.post<{ data?: { user?: User } }>(
      `/admin/restaurants/${restaurantId}/users`, // Placeholder endpoint
      userData
    );
    if (response.data?.data?.user) {
      return response.data.data.user;
    }
    throw new Error("User data not found in response after creation.");
  } catch (error) {
    console.error(
      `Failed to create user for restaurant ${restaurantId}:`,
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `API Error (${error.response.status}): ${
          error.response.data?.message || error.message
        }`
      );
    }
    throw error;
  }
};

/**
 * Updates an existing user for a specific restaurant.
 * Super admin context: Assumes an endpoint like /admin/restaurants/{restaurantId}/users/{userId}
 * @param restaurantId The ID of the restaurant.
 * @param userId The ID of the user to update.
 * @param userData The data to update for the user.
 */
export const updateRestaurantUser = async (
  restaurantId: string,
  userId: string,
  userData: UpdateRestaurantUserPayload
): Promise<User> => {
  try {
    // TODO: Verify actual super admin endpoint. Using placeholder.
    const response = await api.patch<{ data?: { user?: User } }>(
      `/admin/restaurants/${restaurantId}/users/${userId}`, // Placeholder endpoint
      userData
    );
    if (response.data?.data?.user) {
      return response.data.data.user;
    }
    throw new Error("User data not found in response after update.");
  } catch (error) {
    console.error(
      `Failed to update user ${userId} in restaurant ${restaurantId}:`,
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `API Error (${error.response.status}): ${
          error.response.data?.message || error.message
        }`
      );
    }
    throw error;
  }
};

/**
 * Deletes a user from a specific restaurant.
 * Super admin context: Assumes an endpoint like /admin/restaurants/{restaurantId}/users/{userId}
 * @param restaurantId The ID of the restaurant.
 * @param userId The ID of the user to delete.
 */
export const deleteRestaurantUser = async (
  restaurantId: string,
  userId: string
): Promise<void> => {
  try {
    // TODO: Verify actual super admin endpoint. Using placeholder.
    await api.delete(
      `/admin/restaurants/${restaurantId}/users/${userId}` // Placeholder endpoint
    );
  } catch (error) {
    console.error(
      `Failed to delete user ${userId} from restaurant ${restaurantId}:`,
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `API Error (${error.response.status}): ${
          error.response.data?.message || error.message
        }`
      );
    }
    throw error;
  }
};

export default api;
