import { useEffect, useState, useCallback } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton, CardSkeleton } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { cn, formatRupiah } from "@/lib/utils";
import api from "@/lib/api";

interface Summary {
  totalRows: number;
  rowsWithData: number;
  avgMlAccuracy: number | null;
  avgPlanAccuracy: number | null;
  totalWaste: number;
  totalProduction: number;
  wasteRate: number;
  ignoredWarnings: number;
}

interface ChartPoint {
  date: string;
  Direncanakan: number;
  "Prediksi ML": number;
  Aktual: number;
  Limbah: number;
}

interface ReportRow {
  date: string;
  menuId: string;
  menuName: string;
  plannedAmount: number;
  predictedDemand: number | null;
  actualProduction: number | null;
  wasteAmount: number | null;
  warningStatus: string;
  planStatus: string;
  mlAccuracy: number | null;
  planAccuracy: number | null;
  ignoredWarning: boolean;
}

interface ReportData {
  summary: Summary;
  chartData: ChartPoint[];
  rows: ReportRow[];
  menus: { id: string; name: string }[];
}

function AccuracyBadge({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-muted-foreground text-xs">—</span>;
  const color =
    value >= 80
      ? "text-emerald-600"
      : value >= 60
        ? "text-amber-600"
        : "text-red-600";
  return <span className={cn("font-medium text-sm", color)}>{value}%</span>;
}

function formatNum(v: number | null, suffix = "") {
  if (v === null) return "—";
  return `${v}${suffix}`;
}

const DATE_PRESETS = [
  { label: "7 hari terakhir", days: 7 },
  { label: "30 hari terakhir", days: 30 },
  { label: "90 hari terakhir", days: 90 },
];

function getStartDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [preset, setPreset] = useState(30);
  const [menuFilter, setMenuFilter] = useState("ALL");

  const fetchReport = useCallback(() => {
    setLoading(true);
    setError(false);

    const params: Record<string, string> = {
      startDate: getStartDate(preset),
      endDate: getTodayStr(),
    };
    if (menuFilter !== "ALL") params.menuId = menuFilter;

    api
      .get("/reports/forecast-vs-actual", { params })
      .then((r) => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [preset, menuFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Laporan</h1>
          <p className="text-sm text-muted-foreground">
            Perbandingan prediksi ML, rencana Manager, dan realisasi produksi
            aktual.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {/* Menu filter */}
          <Select value={menuFilter} onValueChange={setMenuFilter}>
            <SelectTrigger className="h-8 w-44 text-sm">
              <SelectValue placeholder="Semua menu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Menu</SelectItem>
              {(data?.menus ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Period filter */}
          <div className="flex gap-1">
            {DATE_PRESETS.map((p) => (
              <Button
                key={p.days}
                size="sm"
                variant={preset === p.days ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setPreset(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState onRetry={fetchReport} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground mb-1">
                  Akurasi ML
                </div>
                <div className="text-2xl font-semibold">
                  {data?.summary.avgMlAccuracy != null
                    ? `${data.summary.avgMlAccuracy}%`
                    : "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Prediksi ML vs produksi aktual
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground mb-1">
                  Akurasi Rencana
                </div>
                <div className="text-2xl font-semibold">
                  {data?.summary.avgPlanAccuracy != null
                    ? `${data.summary.avgPlanAccuracy}%`
                    : "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Keputusan Manager vs produksi aktual
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground mb-1">
                  Total Limbah
                </div>
                <div className="text-2xl font-semibold">
                  {data?.summary.totalWaste ?? "—"} porsi
                </div>
                <div
                  className={cn(
                    "text-xs mt-1",
                    (data?.summary.wasteRate ?? 0) > 20
                      ? "text-red-500"
                      : (data?.summary.wasteRate ?? 0) > 10
                        ? "text-amber-600"
                        : "text-emerald-600",
                  )}
                >
                  {data?.summary.wasteRate ?? 0}% dari total produksi
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground mb-1">
                  Warning Diabaikan
                </div>
                <div
                  className={cn(
                    "text-2xl font-semibold",
                    (data?.summary.ignoredWarnings ?? 0) > 0
                      ? "text-red-600"
                      : "text-emerald-600",
                  )}
                >
                  {data?.summary.ignoredWarnings ?? 0}x
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Manager abaikan peringatan EWS
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Tren Perbandingan: Prediksi ML vs Rencana Manager vs Aktual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data?.chartData.length ?? 0) === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  Belum ada data untuk rentang waktu ini.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={data?.chartData ?? []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    {/* Bar: aktual produksi */}
                    <Bar
                      dataKey="Aktual"
                      fill="#B2D8CE"
                      radius={[3, 3, 0, 0]}
                    />
                    {/* Bar: limbah */}
                    <Bar
                      dataKey="Limbah"
                      fill="#FECACA"
                      radius={[3, 3, 0, 0]}
                    />
                    {/* Line: prediksi ML */}
                    <Line
                      type="monotone"
                      dataKey="Prediksi ML"
                      stroke="#0F6E56"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    {/* Line: rencana Manager */}
                    <Line
                      type="monotone"
                      dataKey="Direncanakan"
                      stroke="#6366F1"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Detail Table */}
          <div>
            <h2 className="text-sm font-medium mb-3">
              Detail per Menu per Tanggal
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({data?.rows.length ?? 0} baris)
              </span>
            </h2>

            {(data?.rows.length ?? 0) === 0 ? (
              <div className="bg-background border rounded-lg p-12 text-center text-sm text-muted-foreground">
                Belum ada data rencana produksi untuk rentang waktu ini.
                <br />
                Buka halaman Perencanaan dan approve minimal satu rencana
                terlebih dahulu.
              </div>
            ) : (
              <div className="bg-background border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      {[
                        "Tanggal",
                        "Menu",
                        "Prediksi ML",
                        "Rencana Manager",
                        "Aktual",
                        "Limbah",
                        "Akurasi ML",
                        "Akurasi Rencana",
                        "EWS",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.rows.map((row, i) => (
                      <tr
                        key={`${row.menuId}-${row.date}`}
                        className={cn(
                          "border-b last:border-0",
                          i % 2 !== 0 ? "bg-muted/10" : "",
                          row.ignoredWarning ? "bg-red-50/50" : "",
                        )}
                      >
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {new Date(row.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-3 py-2.5 font-medium">
                          {row.menuName}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {formatNum(row.predictedDemand)}
                        </td>
                        <td className="px-3 py-2.5 text-center font-medium">
                          {row.plannedAmount}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {formatNum(row.actualProduction)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {row.wasteAmount !== null ? (
                            <span
                              className={cn(
                                "font-medium",
                                row.actualProduction &&
                                  row.wasteAmount / row.actualProduction > 0.2
                                  ? "text-red-600"
                                  : "text-muted-foreground",
                              )}
                            >
                              {row.wasteAmount}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <AccuracyBadge value={row.mlAccuracy} />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <AccuracyBadge value={row.planAccuracy} />
                        </td>
                        <td className="px-3 py-2.5">
                          {row.warningStatus === "RISIKO_TINGGI" ? (
                            <StatusBadge
                              variant="risiko"
                              className={cn(
                                "text-[10px]",
                                !row.ignoredWarning && "opacity-50",
                              )}
                            />
                          ) : (
                            <StatusBadge
                              variant="aman"
                              className="text-[10px]"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Legenda baris merah */}
                {(data?.summary.ignoredWarnings ?? 0) > 0 && (
                  <div className="px-4 py-2.5 border-t bg-red-50/50 flex items-center gap-2 text-xs text-red-700">
                    <span className="inline-block w-3 h-3 rounded bg-red-200 shrink-0" />
                    Baris berwarna merah = Manager menyetujui rencana meski
                    mendapat peringatan risiko limbah tinggi dari sistem EWS.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
