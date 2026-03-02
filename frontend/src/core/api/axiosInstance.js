import axios from "axios";
import { TOKEN_KEY } from "../utils/constants";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[RESPONSE] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/");
    console.warn(`[ERROR] ${error.response?.status} ${error.config?.url} | isAuthRoute: ${isAuthRoute}`);
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.clear();
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
