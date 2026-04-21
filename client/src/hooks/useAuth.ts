import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import type { Role } from "@/types";

export function useAuth() {
  const { user, setUser, logout } = useAuthStore();

  const isAuthenticated = !!user;
  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  /** Dipanggil saat app mount — restore session dari httpOnly cookie */
  async function initAuth() {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      // Cookie tidak ada atau expired — biarkan user di halaman login
      logout();
    }
  }

  return { user, isAuthenticated, hasRole, setUser, logout, initAuth };
}
