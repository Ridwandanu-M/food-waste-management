import { useEffect, useState, useCallback } from "react";
import { NumericStepper } from "@/components/shared/NumericStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Leaf, CalendarDays, LogOut } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { toast } from "sonner";
import { formatDate, getCategoryColor, cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Menu } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

interface EntryRow {
  menu: Menu;
  production: number;
  waste: number;
}

function EntryCardSkeleton() {
  return (
    <div className="bg-background border rounded-xl p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-36 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
      </div>
      <div className="h-12 bg-muted rounded-lg" />
      <div className="h-12 bg-muted rounded-lg" />
    </div>
  );
}

export default function EntryPage() {
  const today = new Date().toISOString();
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchMenus = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .get("/menus?status=active")
      .then((r) => {
        const active: Menu[] = r.data;
        setRows(active.map((m) => ({ menu: m, production: 0, waste: 0 })));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  function updateRow(
    menuId: string,
    field: "production" | "waste",
    val: number,
  ) {
    setRows((prev) =>
      prev.map((r) => (r.menu.id === menuId ? { ...r, [field]: val } : r)),
    );
  }

  const filtered = rows.filter((r) =>
    r.menu.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalProd = rows.reduce((a, r) => a + r.production, 0);
  const totalWaste = rows.reduce((a, r) => a + r.waste, 0);
  const efficiency =
    totalProd > 0
      ? Math.round(((totalProd - totalWaste) / totalProd) * 100)
      : 0;

  const highWasteItems = rows.filter(
    (r) => r.production > 0 && r.waste / r.production > 0.2,
  );

  const categorySummary = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.menu.category] = (acc[r.menu.category] ?? 0) + 1;
    return acc;
  }, {});

  async function handleSave() {
    const filledRows = rows.filter((r) => r.production > 0);
    if (filledRows.length === 0) {
      toast.error("Tidak ada data", {
        description: "Isi minimal satu data produksi sebelum menyimpan.",
      });
      return;
    }
    setSaving(true);
    try {
      const records = filledRows.map((r) => ({
        menuId: r.menu.id,
        date: new Date().toISOString(),
        actualProduction: r.production,
        actualSales: Math.max(0, r.production - r.waste),
        wasteAmount: r.waste,
      }));
      await api.post("/daily-records", { records });
      toast("Laporan disimpan", {
        description: `${records.length} item berhasil dicatat.`,
      });
    } catch {
      toast.error("Gagal menyimpan", {
        description: "Periksa koneksi dan coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await api.post("/auth/logout");
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Staff Header */}
      <header className="bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="text-base font-semibold text-primary">WasteWise</div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
            title="Keluar"
          >
            <LogOut size={14} />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground border rounded-md px-3 py-1.5">
            <CalendarDays size={14} />
            {formatDate(today)}
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Menyimpan..." : "Simpan Laporan"}
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-1 text-xs text-muted-foreground">
          Shift Pagi • Dapur Utama
        </div>
        <h1 className="text-3xl font-bold mb-6">Entri Data</h1>

        <div className="flex gap-6">
          {/* Menu list */}
          <div className="flex-1 space-y-4">
            <div className="bg-background border rounded-xl px-4 py-3 flex items-center gap-3">
              <Input
                placeholder="Pindai atau cari nama menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 text-base p-0 h-auto"
              />
              <Button variant="outline" size="sm" className="text-xs">
                Kategori
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Urutkan
              </Button>
            </div>

            {loading ? (
              <>
                <EntryCardSkeleton />
                <EntryCardSkeleton />
                <EntryCardSkeleton />
              </>
            ) : error ? (
              <ErrorState onRetry={fetchMenus} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                {search
                  ? "Tidak ada menu yang cocok."
                  : "Tidak ada menu aktif."}
              </div>
            ) : (
              filtered.map((row) => (
                <div
                  key={row.menu.id}
                  className="bg-background border rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold",
                        getCategoryColor(row.menu.category),
                      )}
                    >
                      {row.menu.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-base">
                        {row.menu.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {row.menu.category} • {row.menu.unit}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Produksi
                      </span>
                      <NumericStepper
                        large
                        value={row.production}
                        onChange={(v) =>
                          updateRow(row.menu.id, "production", v)
                        }
                      />
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2",
                        row.waste > 0 &&
                          row.production > 0 &&
                          row.waste / row.production > 0.2
                          ? "bg-red-50"
                          : "bg-muted/30",
                      )}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Limbah (Sisa)
                      </span>
                      <NumericStepper
                        large
                        value={row.waste}
                        onChange={(v) => updateRow(row.menu.id, "waste", v)}
                        max={row.production}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right panel */}
          <div className="w-72 space-y-4">
            <div className="bg-background border rounded-xl p-5 text-center">
              <Leaf size={28} className="text-primary mx-auto mb-2" />
              <div className="text-4xl font-bold">{efficiency}%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Efisiensi Porsi Hari Ini
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${efficiency}%` }}
                />
              </div>
            </div>

            <div className="bg-background border rounded-xl p-5">
              <div className="font-medium text-sm mb-3">Status Kategori</div>
              {Object.keys(categorySummary).length === 0 ? (
                <p className="text-xs text-muted-foreground">Memuat...</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(categorySummary).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span>{cat}</span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded">
                        {count} Item
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {highWasteItems.length > 0 && (
              <div className="border-l-4 border-amber-500 bg-amber-50 rounded-r-xl p-4">
                <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-1">
                  <AlertTriangle size={14} /> Sisa Tinggi Terdeteksi
                </div>
                {highWasteItems.map((r) => (
                  <p key={r.menu.id} className="text-xs text-amber-700">
                    {r.menu.name} menunjukkan sisa{" "}
                    {Math.round((r.waste / r.production) * 100)}% dari produksi.
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
