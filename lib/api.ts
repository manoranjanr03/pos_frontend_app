import axios from "axios";
import { BASE_URL } from "./endpoints";

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

export default api;
