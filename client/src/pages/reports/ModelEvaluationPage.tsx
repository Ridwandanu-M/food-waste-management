import { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton, TableSkeleton } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { cn } from "@/lib/utils";
import { FlaskConical, TrendingUp, AlertTriangle, Info } from "lucide-react";
import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PredictionDetail {
  date: string;
  actual: number;
  predicted: number;
  error: number;
  errorPct: number;
}

interface MenuMetrics {
  menuId: string;
  menuName: string;
  trainDays: number;
  testDays: number;
  mae: number;
  rmse: number;
  mape: number;
  accuracy: number;
  method: string;
  predictions: PredictionDetail[];
}

interface EvaluationResult {
  totalMenus: number;
  evaluatedMenus: number;
  avgMae: number;
  avgRmse: number;
  avgMape: number;
  avgAccuracy: number;
  menus: MenuMetrics[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function AccuracyRing({ value }: { value: number }) {
  const color = value >= 85 ? "#0F6E56" : value >= 70 ? "#EF9F27" : "#E24B4A";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-3xl font-semibold" style={{ color }}>
        {value}%
      </div>
      <div className="text-xs text-muted-foreground">Akurasi</div>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    prophet: "bg-emerald-100 text-emerald-700",
    moving_average: "bg-blue-100 text-blue-700",
    insufficient_data: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    prophet: "Prophet ML",
    moving_average: "Moving Average",
    insufficient_data: "Data kurang",
  };
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full",
        styles[method] ?? "bg-gray-100 text-gray-600",
      )}
    >
      {labels[method] ?? method}
    </span>
  );
}

function AccuracyLabel({ value }: { value: number }) {
  if (value >= 85)
    return (
      <span className="text-xs text-emerald-600 font-medium">Sangat Baik</span>
    );
  if (value >= 70)
    return (
      <span className="text-xs text-amber-600 font-medium">Cukup Baik</span>
    );
  if (value >= 50)
    return (
      <span className="text-xs text-orange-500 font-medium">
        Perlu Data Lebih
      </span>
    );
  return (
    <span className="text-xs text-red-600 font-medium">
      Data Terlalu Sedikit
    </span>
  );
}

const TEST_DAY_OPTIONS = [
  { label: "3 hari", value: 3 },
  { label: "5 hari", value: 5 },
  { label: "7 hari", value: 7 },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ModelEvaluationPage() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [testDays, setTestDays] = useState(7);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const runEvaluation = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .get("/reports/model-evaluation", { params: { testDays } })
      .then((r) => setResult(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [testDays]);

  const evaluated =
    result?.menus.filter((m) => m.method !== "insufficient_data") ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Evaluasi Model</h1>
          <p className="text-sm text-muted-foreground">
            Uji akurasi model Prophet menggunakan walk-forward validation pada
            data historis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {TEST_DAY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={testDays === opt.value ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setTestDays(opt.value)}
              >
                Test {opt.label}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={runEvaluation}
            disabled={loading}
            className="gap-1.5"
          >
            <FlaskConical size={14} />
            {loading ? "Mengevaluasi..." : "Jalankan Evaluasi"}
          </Button>
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-muted/40 border rounded-lg text-sm text-muted-foreground">
        <Info size={16} className="shrink-0 mt-0.5 text-primary" />
        <div>
          <span className="font-medium text-foreground">
            Cara kerja evaluasi:{" "}
          </span>
          Data historis dibagi menjadi <strong>train set</strong> (awal) dan{" "}
          <strong>test set</strong> ({testDays} hari terakhir). Model dilatih
          pada train set, lalu memprediksi test set. Hasil prediksi dibandingkan
          dengan <strong>actualSales</strong> (demand riil) — bukan
          actualProduction. Semakin tinggi akurasi, semakin andal prediksi
          demand-nya.
        </div>
      </div>

      {/* Empty state — belum dijalankan */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border rounded-lg bg-background">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FlaskConical size={22} className="text-primary" />
          </div>
          <div className="text-center">
            <div className="font-medium text-sm">Evaluasi belum dijalankan</div>
            <div className="text-xs text-muted-foreground mt-1">
              Klik "Jalankan Evaluasi" untuk menghitung akurasi model Prophet.
            </div>
          </div>
          <Button size="sm" onClick={runEvaluation} className="gap-1.5">
            <FlaskConical size={14} /> Jalankan Evaluasi
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={4} cols={6} />
        </div>
      )}

      {/* Error */}
      {error && (
        <ErrorState
          message="Evaluasi gagal. Pastikan ML Service (ml-service) sedang berjalan."
          onRetry={runEvaluation}
        />
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground mb-2">
                  Rata-rata Akurasi
                </div>
                <div
                  className={cn(
                    "text-2xl font-semibold",
                    result.avgAccuracy >= 85
                      ? "text-emerald-600"
                      : result.avgAccuracy >= 70
                        ? "text-amber-600"
                        : "text-red-600",
                  )}
                >
                  {result.avgAccuracy}%
                </div>
                <AccuracyLabel value={result.avgAccuracy} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground mb-2">MAPE</div>
                <div className="text-2xl font-semibold">{result.avgMape}%</div>
                <div className="text-xs text-muted-foreground">
                  Mean Absolute % Error
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground mb-2">MAE</div>
                <div className="text-2xl font-semibold">{result.avgMae}</div>
                <div className="text-xs text-muted-foreground">
                  Rata-rata selisih porsi
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="text-xs text-muted-foreground mb-2">
                  Menu Dievaluasi
                </div>
                <div className="text-2xl font-semibold">
                  {result.evaluatedMenus}
                  <span className="text-base text-muted-foreground font-normal">
                    /{result.totalMenus}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.totalMenus - result.evaluatedMenus} data kurang
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Akurasi per menu — bar chart */}
          {evaluated.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Akurasi per Menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={evaluated.map((m) => ({
                      name:
                        m.menuName.length > 15
                          ? m.menuName.slice(0, 15) + "…"
                          : m.menuName,
                      Akurasi: m.accuracy,
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      unit="%"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip formatter={(v) => [`${v}%`, "Akurasi"]} />
                    <ReferenceLine
                      x={85}
                      stroke="#0F6E56"
                      strokeDasharray="4 4"
                      label={{
                        value: "85% (target)",
                        fontSize: 10,
                        fill: "#0F6E56",
                      }}
                    />
                    <ReferenceLine
                      x={70}
                      stroke="#EF9F27"
                      strokeDasharray="4 4"
                    />
                    <Bar
                      dataKey="Akurasi"
                      radius={[0, 4, 4, 0]}
                      fill="#0F6E56"
                      label={{
                        position: "right",
                        fontSize: 11,
                        formatter: (v: any) => `${v}%`,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Detail per menu */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium">Detail per Menu</h2>
            {result.menus.map((menu) => (
              <div
                key={menu.menuId}
                className="bg-background border rounded-lg overflow-hidden"
              >
                {/* Menu header */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors"
                  onClick={() =>
                    setExpandedMenu(
                      expandedMenu === menu.menuId ? null : menu.menuId,
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{menu.menuName}</span>
                    <MethodBadge method={menu.method} />
                  </div>
                  <div className="flex items-center gap-6">
                    {menu.method !== "insufficient_data" ? (
                      <>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            MAE
                          </div>
                          <div className="text-sm font-medium">
                            {menu.mae} porsi
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            MAPE
                          </div>
                          <div className="text-sm font-medium">
                            {menu.mape}%
                          </div>
                        </div>
                        <AccuracyRing value={menu.accuracy} />
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertTriangle size={13} className="text-amber-500" />
                        Data tidak cukup untuk evaluasi
                      </div>
                    )}
                    <TrendingUp
                      size={14}
                      className={cn(
                        "text-muted-foreground transition-transform",
                        expandedMenu === menu.menuId && "rotate-180",
                      )}
                    />
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedMenu === menu.menuId &&
                  menu.predictions.length > 0 && (
                    <div className="border-t">
                      <div className="px-4 py-2 bg-muted/20 flex gap-6 text-xs text-muted-foreground">
                        <span>
                          Train:{" "}
                          <strong className="text-foreground">
                            {menu.trainDays} hari
                          </strong>
                        </span>
                        <span>
                          Test:{" "}
                          <strong className="text-foreground">
                            {menu.testDays} hari
                          </strong>
                        </span>
                        <span>
                          RMSE:{" "}
                          <strong className="text-foreground">
                            {menu.rmse}
                          </strong>
                        </span>
                        <span className="ml-auto italic">
                          Target prediksi: actualSales (demand riil)
                        </span>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/10">
                            {[
                              "Tanggal",
                              "Aktual (Sales)",
                              "Prediksi",
                              "Selisih",
                              "Error %",
                            ].map((h) => (
                              <th
                                key={h}
                                className="text-left px-4 py-2 text-xs font-medium text-muted-foreground"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {menu.predictions.map((p) => (
                            <tr
                              key={p.date}
                              className="border-b last:border-0 hover:bg-muted/10"
                            >
                              <td className="px-4 py-2 text-muted-foreground">
                                {p.date}
                              </td>
                              <td className="px-4 py-2 font-medium">
                                {p.actual}
                              </td>
                              <td className="px-4 py-2">
                                {Math.round(p.predicted)}
                              </td>
                              <td
                                className={cn(
                                  "px-4 py-2 font-medium",
                                  p.error > 10
                                    ? "text-red-600"
                                    : p.error > 5
                                      ? "text-amber-600"
                                      : "text-emerald-600",
                                )}
                              >
                                {p.error > 0 ? "+" : ""}
                                {p.error}
                              </td>
                              <td
                                className={cn(
                                  "px-4 py-2",
                                  p.errorPct > 20
                                    ? "text-red-600"
                                    : p.errorPct > 10
                                      ? "text-amber-600"
                                      : "text-emerald-600",
                                )}
                              >
                                {p.errorPct}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Interpretasi */}
          <div className="border rounded-lg p-4 bg-muted/20 space-y-2">
            <div className="text-sm font-medium">Panduan Interpretasi</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-muted-foreground">
              <div>
                <span className="text-emerald-600 font-medium">≥ 85%</span> —
                Model sangat baik, prediksi andal
              </div>
              <div>
                <span className="font-medium">MAE</span> — Selisih rata-rata
                dalam satuan porsi
              </div>
              <div>
                <span className="text-amber-600 font-medium">70–84%</span> —
                Cukup baik untuk operasional harian
              </div>
              <div>
                <span className="font-medium">MAPE</span> — Persentase error
                rata-rata
              </div>
              <div>
                <span className="text-orange-500 font-medium">50–69%</span> —
                Tambah data historis agar lebih akurat
              </div>
              <div>
                <span className="font-medium">RMSE</span> — Sensitif terhadap
                error besar
              </div>
              <div>
                <span className="text-red-600 font-medium">&lt; 50%</span> —
                Data terlalu sedikit atau terlalu acak
              </div>
              <div>
                <span className="font-medium">Walk-forward</span> — Test
                dilakukan di 20% data terakhir
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
