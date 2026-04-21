import { Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";
import { ROUTES } from "@/lib/constants";

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

// Redirect default per role jika mengakses halaman yang tidak diizinkan
const ROLE_HOME: Record<Role, string> = {
  ADMIN: ROUTES.MANAGEMENT_USERS,
  MANAGER: ROUTES.DASHBOARD,
  STAFF: ROUTES.ENTRY,
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user, hasRole } = useAuth();

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  if (!hasRole(...allowedRoles)) {
    const home = user ? ROLE_HOME[user.role] : ROUTES.LOGIN;
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
