import { useEffect, useState, useCallback } from "react";
import { Pencil, Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import MenuFormModal from "./MenuFormModal";
import { formatRupiah, calcMargin, cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Menu } from "@/types";

function MarginCell({ price, baseCost }: { price: number; baseCost: number }) {
  const m = calcMargin(price, baseCost);
  return (
    <span
      className={cn(
        "font-medium",
        m >= 40
          ? "text-emerald-600"
          : m >= 20
            ? "text-amber-600"
            : "text-red-600",
      )}
    >
      {m}%
    </span>
  );
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "active" | "archived"
  >("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMenu, setEditMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await api.get("/menus", { params });
      setMenus(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  async function toggleArchive(menu: Menu) {
    setTogglingId(menu.id);
    try {
      await api.patch(`/menus/${menu.id}`, { isActive: !menu.isActive });
      toast(menu.isActive ? "Menu diarsipkan" : "Menu dipulihkan", {
        description: `${menu.name} berhasil ${menu.isActive ? "diarsipkan" : "dipulihkan"}.`,
      });
      fetchMenus();
    } catch {
      toast.error("Gagal", {
        description: "Tidak dapat mengubah status menu.",
      });
    } finally {
      setTogglingId(null);
    }
  }

  function openAdd() {
    setEditMenu(null);
    setModalOpen(true);
  }
  function openEdit(m: Menu) {
    setEditMenu(m);
    setModalOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Manajemen Menu</h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar menu, harga, dan pantau margin keuntungan.
          </p>
        </div>
        <Button onClick={openAdd} size="sm">
          + Tambah Menu
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 p-3 bg-background border rounded-lg">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Cari nama menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="archived">Diarsipkan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={4} cols={7} />
      ) : error ? (
        <ErrorState onRetry={fetchMenus} />
      ) : (
        <div className="bg-background border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {[
                  "Nama Menu",
                  "Satuan",
                  "Harga Jual",
                  "HPP",
                  "Margin",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      message="Belum ada menu. Tambahkan menu pertama Anda."
                      action={
                        <Button size="sm" onClick={openAdd}>
                          + Tambah Menu
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                menus.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b last:border-0 hover:bg-muted/10"
                  >
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-muted rounded text-xs">
                        {m.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatRupiah(m.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatRupiah(m.baseCost)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <MarginCell price={m.price} baseCost={m.baseCost} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={m.isActive ? "aktif" : "diarsipkan"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => toggleArchive(m)}
                          disabled={togglingId === m.id}
                          className={cn(
                            "p-1.5 rounded hover:bg-muted transition-opacity",
                            togglingId === m.id
                              ? "opacity-40 cursor-wait"
                              : "text-muted-foreground hover:text-amber-600",
                          )}
                          title={m.isActive ? "Arsipkan" : "Pulihkan"}
                        >
                          {m.isActive ? (
                            <Archive size={14} />
                          ) : (
                            <RotateCcw size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {menus.length > 0 && (
            <div className="px-4 py-2 border-t text-xs text-muted-foreground">
              Menampilkan {menus.length} menu
            </div>
          )}
        </div>
      )}

      <MenuFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        menu={editMenu}
        onSuccess={() => {
          setModalOpen(false);
          fetchMenus();
          toast(editMenu ? "Menu diperbarui" : "Menu ditambahkan", {
            description: editMenu
              ? "Data menu berhasil disimpan."
              : "Menu baru berhasil dibuat.",
          });
        }}
      />
    </div>
  );
}
