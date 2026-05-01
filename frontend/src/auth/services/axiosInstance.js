import axios from "axios";

/**
 * Shared Axios instance for all API calls.
 *
 * baseURL is read from VITE_BACKEND_URL (set in frontend/.env).
 * withCredentials: true — sends the HttpOnly JWT cookie on every request,
 * which is required for /api/auth/me and all protected endpoints.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
