import { useEffect, useState, useCallback } from "react";
import { Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import UserFormModal from "./UserFormModal";
import { getInitials, formatDate, cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import api from "@/lib/api";
import type { User, Role } from "@/types";

const roleFilters: { label: string; value: Role | "ALL" }[] = [
  { label: "Semua", value: "ALL" },
  { label: "Admin", value: "ADMIN" },
  { label: "Manajer", value: "MANAGER" },
  { label: "Staff", value: "STAFF" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter !== "ALL") params.role = roleFilter;
      const res = await api.get("/users", { params });
      setUsers(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function toggleActive(user: User) {
    setTogglingId(user.id);
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      toast(user.isActive ? "Pengguna dinonaktifkan" : "Pengguna diaktifkan", {
        description: `${user.name} berhasil ${user.isActive ? "dinonaktifkan" : "diaktifkan"}.`,
      });
      fetchUsers();
    } catch {
      toast.error("Gagal", {
        description: "Tidak dapat mengubah status pengguna.",
      });
    } finally {
      setTogglingId(null);
    }
  }

  function openAdd() {
    setEditUser(null);
    setModalOpen(true);
  }
  function openEdit(u: User) {
    setEditUser(u);
    setModalOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Manajemen Pengguna</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun dan hak akses tim operasional dan analis.
          </p>
        </div>
        <Button onClick={openAdd} size="sm">
          + Tambah Pengguna
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 p-3 bg-background border rounded-lg">
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex gap-1 ml-auto">
          {roleFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                roleFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={4} cols={6} />
      ) : error ? (
        <ErrorState onRetry={fetchUsers} />
      ) : (
        <div className="bg-background border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Nama", "Email", "Role", "Status", "Bergabung", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="Tidak ada pengguna ditemukan." />
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={cn(
                      "border-b last:border-0",
                      i % 2 !== 0 ? "bg-muted/10" : "",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={u.isActive ? "aktif" : "nonaktif"}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={togglingId === u.id}
                          className={cn(
                            "p-1.5 rounded hover:bg-muted transition-opacity",
                            togglingId === u.id ? "opacity-40 cursor-wait" : "",
                            u.isActive
                              ? "text-muted-foreground hover:text-destructive"
                              : "text-emerald-600",
                          )}
                          title={u.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {users.length > 0 && (
            <div className="px-4 py-2 border-t text-xs text-muted-foreground">
              Menampilkan {users.length} pengguna
            </div>
          )}
        </div>
      )}

      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editUser}
        onSuccess={() => {
          setModalOpen(false);
          fetchUsers();
          toast(editUser ? "Pengguna diperbarui" : "Pengguna ditambahkan", {
            description: editUser
              ? "Data pengguna berhasil disimpan."
              : "Akun baru berhasil dibuat.",
          });
        }}
      />
    </div>
  );
}
