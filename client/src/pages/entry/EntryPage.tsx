import { useEffect, useState } from "react";
import { NumericStepper } from "@/components/shared/NumericStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Leaf, CalendarDays } from "lucide-react";
import { formatDate, getCategoryColor, cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Menu } from "@/types";

interface EntryRow {
  menu: Menu;
  production: number;
  waste: number;
}

export default function EntryPage() {
  const today = new Date().toISOString();
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.get("/menus?status=active").then((r) => {
      const active: Menu[] = r.data;
      setRows(active.map((m) => ({ menu: m, production: 0, waste: 0 })));
    });
  }, []);

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
    setSaving(true);
    try {
      const records = rows
        .filter((r) => r.production > 0)
        .map((r) => ({
          menuId: r.menu.id,
          date: new Date().toISOString(),
          actualProduction: r.production,
          actualSales: Math.max(0, r.production - r.waste),
          wasteAmount: r.waste,
        }));
      await api.post("/daily-records", { records });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Staff Header — simplified, no sidebar */}
      <header className="bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="text-base font-semibold text-primary">WasteWise</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground border rounded-md px-3 py-1.5">
            <CalendarDays size={14} />
            {formatDate(today)}
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {savedSuccess
              ? "✓ Tersimpan"
              : saving
                ? "Menyimpan..."
                : "Simpan Laporan"}
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
            {/* Search bar */}
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

            {/* Menu cards */}
            {filtered.map((row) => (
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
                      onChange={(v) => updateRow(row.menu.id, "production", v)}
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
            ))}
          </div>

          {/* Right panel */}
          <div className="w-72 space-y-4">
            {/* Efficiency */}
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

            {/* Category Status */}
            <div className="bg-background border rounded-xl p-5">
              <div className="font-medium text-sm mb-3">Status Kategori</div>
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
            </div>

            {/* High Waste Alerts */}
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
