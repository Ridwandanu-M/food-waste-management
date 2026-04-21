import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // kirim httpOnly cookie otomatis
  headers: { "Content-Type": "application/json" },
});

// Response interceptor: tangani 401 Unauthorized
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Logout di store untuk mengupdate state global tanpa reload halaman
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default api;
