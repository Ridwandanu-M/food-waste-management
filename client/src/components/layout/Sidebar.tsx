import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  FlaskConical,
} from "lucide-react";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { RoleBadge } from "@/components/shared/RoleBadge";
import api from "@/lib/api";

const navItem =
  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors";
const active = "bg-primary text-primary-foreground";
const inactive = "text-muted-foreground hover:bg-muted hover:text-foreground";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mgmtOpen, setMgmtOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);

  const isManager = user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";

  async function handleLogout() {
    await api.post("/auth/logout");
    logout();
    navigate("/login");
  }

  return (
    <aside className="w-56 shrink-0 border-r bg-background flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b">
        <div className="text-base font-semibold text-primary">WasteWise</div>
        <div className="text-xs text-muted-foreground">
          Presisi Keberlanjutan
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {isManager && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(navItem, isActive ? active : inactive)
              }
            >
              <LayoutDashboard size={16} /> Dasbor
            </NavLink>

            <NavLink
              to="/planning"
              className={({ isActive }) =>
                cn(navItem, isActive ? active : inactive)
              }
            >
              <CalendarDays size={16} /> Perencanaan
            </NavLink>

            {/* Laporan — expandable */}
            <div>
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className={cn(navItem, "w-full justify-between", inactive)}
              >
                <span className="flex items-center gap-3">
                  <BarChart3 size={16} /> Laporan
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform",
                    reportsOpen && "rotate-180",
                  )}
                />
              </button>
              {reportsOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  <NavLink
                    to="/reports"
                    end
                    className={({ isActive }) =>
                      cn(navItem, isActive ? active : inactive, "text-xs")
                    }
                  >
                    Forecast vs Aktual
                  </NavLink>
                  <NavLink
                    to="/reports/evaluation"
                    className={({ isActive }) =>
                      cn(navItem, isActive ? active : inactive, "text-xs")
                    }
                  >
                    <FlaskConical size={12} /> Evaluasi Model
                  </NavLink>
                </div>
              )}
            </div>
          </>
        )}

        {(isAdmin || isManager) && (
          <NavLink
            to="/entry"
            className={({ isActive }) =>
              cn(navItem, isActive ? active : inactive)
            }
          >
            <ClipboardList size={16} /> Entri Data
          </NavLink>
        )}

        {isAdmin && (
          <div>
            <button
              onClick={() => setMgmtOpen(!mgmtOpen)}
              className={cn(navItem, "w-full justify-between", inactive)}
            >
              <span className="flex items-center gap-3">
                <Users size={16} /> Manajemen
              </span>
              <ChevronDown
                size={14}
                className={cn("transition-transform", mgmtOpen && "rotate-180")}
              />
            </button>
            {mgmtOpen && (
              <div className="ml-6 mt-1 space-y-1">
                <NavLink
                  to="/management/users"
                  className={({ isActive }) =>
                    cn(navItem, isActive ? active : inactive, "text-xs")
                  }
                >
                  Pengguna
                </NavLink>
                <NavLink
                  to="/management/menu"
                  className={({ isActive }) =>
                    cn(navItem, isActive ? active : inactive, "text-xs")
                  }
                >
                  Menu
                </NavLink>
              </div>
            )}
          </div>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(navItem, isActive ? active : inactive)
          }
        >
          <Settings size={16} /> Pengaturan
        </NavLink>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
            {getInitials(user?.name ?? "")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user?.name}</div>
            <RoleBadge
              role={user?.role ?? "STAFF"}
              className="text-[10px] px-1.5 py-0"
            />
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
            title="Keluar"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
