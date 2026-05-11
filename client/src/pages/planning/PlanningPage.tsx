import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NumericStepper } from "@/components/shared/NumericStepper";
import { TableSkeleton } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { toast } from "sonner";
import { Download, Sparkles, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { WarningStatus } from "@/types";

interface PlanRow {
  menuId: string;
  menuName: string;
  predictedAmount: number;
  plannedAmount: number;
  warningStatus: WarningStatus;
  status: "DRAFT" | "APPROVED";
}

function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function savePlans(rows: PlanRow[]) {
  const plans = rows.map((r) => ({
    menuId: r.menuId,
    predictedAmount: r.predictedAmount,
    plannedAmount: r.plannedAmount,
    warningStatus: r.warningStatus,
    status: r.status,
    targetDate: getTodayDateStr(),
  }));
  await api.post("/production-plans/bulk", { plans });
}

export default function PlanningPage() {
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [tolerance, setTolerance] = useState(10);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      api.get("/forecasts/today"),
      api.get("/settings"),
      api.get("/production-plans/today"),
    ])
      .then(([forecastRes, settingsRes, plansRes]) => {
        const forecasts: any[] = forecastRes.data;
        const existingPlans: any[] = plansRes.data;
        const tol = settingsRes.data.wasteTolerancePercent ?? 10;
        setTolerance(tol);

        const planMap: Record<string, any> = {};
        for (const p of existingPlans) planMap[p.menuId] = p;

        setRows(
          forecasts.map((f) => {
            const existing = planMap[f.menuId];
            return {
              menuId: f.menuId,
              menuName: f.menu?.name ?? "—",
              predictedAmount: Math.round(f.predictedDemand),
              plannedAmount: existing
                ? Math.round(existing.plannedAmount)
                : Math.round(f.predictedDemand),
              warningStatus: (existing?.warningStatus ??
                "AMAN") as WarningStatus,
              status: (existing?.status ?? "DRAFT") as "DRAFT" | "APPROVED",
            };
          }),
        );
        if (forecasts[0]?.insight) setInsight(forecasts[0].insight);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function calcWarning(planned: number, predicted: number): WarningStatus {
    return planned > predicted * (1 + tolerance / 100)
      ? "RISIKO_TINGGI"
      : "AMAN";
  }

  function updatePlanned(menuId: string, val: number) {
    setRows((prev) =>
      prev.map((r) =>
        r.menuId === menuId
          ? {
              ...r,
              plannedAmount: val,
              warningStatus: calcWarning(val, r.predictedAmount),
            }
          : r,
      ),
    );
  }

  async function approveRow(menuId: string) {
    setSaving(menuId);
    try {
      const updated = rows.map((r) =>
        r.menuId === menuId ? { ...r, status: "APPROVED" as const } : r,
      );
      const target = updated.find((r) => r.menuId === menuId);
      if (target) await savePlans([target]);
      setRows(updated);
      toast("Disetujui", {
        description: `Rencana produksi ${target?.menuName} berhasil disimpan.`,
      });
    } catch {
      toast.error("Gagal", {
        description: "Tidak dapat menyimpan rencana.",
      });
    } finally {
      setSaving(null);
    }
  }

  async function approveAll() {
    setSaving("all");
    try {
      const updated = rows.map((r) => ({ ...r, status: "APPROVED" as const }));
      await savePlans(updated);
      setRows(updated);
      toast("Semua disetujui", {
        description: `${updated.length} rencana produksi berhasil disimpan.`,
      });
    } catch {
      toast.error("Gagal", {
        description: "Tidak dapat menyimpan semua rencana.",
      });
    } finally {
      setSaving(null);
    }
  }

  const riskCount = rows.filter(
    (r) => r.warningStatus === "RISIKO_TINGGI",
  ).length;
  const totalMenus = rows.length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Perencanaan Produksi</h1>
          <p className="text-sm text-muted-foreground">
            Evaluasi prediksi permintaan ML dan tetapkan target produksi harian.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-1" /> Ekspor Data
          </Button>
          <Button
            onClick={approveAll}
            disabled={saving === "all" || loading}
            size="sm"
          >
            <Check size={14} className="mr-1" />
            {saving === "all" ? "Menyimpan..." : "Approve Semua"}
          </Button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Main table */}
        <div className="flex-1">
          {loading ? (
            <TableSkeleton rows={4} cols={6} />
          ) : error ? (
            <ErrorState onRetry={fetchData} />
          ) : (
            <div className="bg-background border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <h2 className="text-sm font-medium">
                    Target Produksi Harian
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tanggal target:{" "}
                    <span className="font-medium text-foreground">
                      {new Date().toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Sparkles size={12} /> Prediksi ML Aktif
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    {[
                      "STATUS",
                      "MENU ITEM",
                      "PREDIKSI (PORSI)",
                      "RENCANA (PORSI)",
                      "STATUS EWS",
                      "AKSI",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        Belum ada data forecast untuk hari ini.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.menuId}
                        className="border-b last:border-0 hover:bg-muted/10"
                      >
                        <td className="px-4 py-3">
                          <StatusBadge
                            variant={
                              row.status === "APPROVED" ? "disetujui" : "draft"
                            }
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {row.menuName}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {row.predictedAmount}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <NumericStepper
                              value={row.plannedAmount}
                              onChange={(v) => updatePlanned(row.menuId, v)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge
                            variant={
                              row.warningStatus === "RISIKO_TINGGI"
                                ? "risiko"
                                : "aman"
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => approveRow(row.menuId)}
                            disabled={
                              row.status === "APPROVED" || saving === row.menuId
                            }
                            className={cn(
                              "w-7 h-7 rounded flex items-center justify-center mx-auto transition",
                              row.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-600 cursor-default"
                                : saving === row.menuId
                                  ? "bg-muted text-muted-foreground cursor-wait"
                                  : "bg-muted hover:bg-emerald-100 hover:text-emerald-600 text-muted-foreground",
                            )}
                            title={
                              row.status === "APPROVED"
                                ? "Sudah disetujui"
                                : "Setujui baris ini"
                            }
                          >
                            <Check size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-64 space-y-4">
          <div className="bg-background border rounded-lg p-4">
            <div className="text-sm font-medium mb-3">
              Ringkasan Sistem Peringatan
            </div>
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                riskCount > 0 ? "bg-red-50" : "bg-emerald-50",
              )}
            >
              <AlertTriangle
                size={20}
                className={riskCount > 0 ? "text-red-500" : "text-emerald-500"}
              />
              <div>
                <div className="text-xs text-muted-foreground">
                  Item Risiko Tinggi
                </div>
                <div className="font-semibold text-sm">
                  {riskCount} / {totalMenus} Menu
                </div>
              </div>
            </div>
            {insight && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Insight Prediksi ML
                </div>
                <div className="text-xs border-l-2 border-primary pl-3 text-muted-foreground leading-relaxed">
                  {insight}
                </div>
              </div>
            )}
          </div>

          <div className="bg-background border rounded-lg p-4">
            <div className="text-sm font-medium mb-2">Pengaturan Toleransi</div>
            <div className="text-xs text-muted-foreground mb-3">
              Batas deviasi aman antara rencana produksi dan prediksi ML.
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Toleransi Lebih (Surplus)</span>
              <span className="text-primary font-semibold">+{tolerance}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(tolerance * 2, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
