import axios from "axios";

// Create configured axios instance
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for securing and sending HTTP-only cookies
});

// Request interceptor to automatically attach authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error messages so the frontend can display them reliably
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred. Please try again.";
    
    return Promise.reject({
      ...error,
      customMessage: message,
      status: error.response?.status,
    });
  }
);

export default api;
