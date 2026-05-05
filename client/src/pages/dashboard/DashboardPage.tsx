import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatRupiah } from "@/lib/utils";
import api from "@/lib/api";

interface DashboardData {
  totalWasteKg: number;
  wasteVsLastMonth: number;
  forecastAccuracy: number;
  accuracyVsTarget: number;
  estimatedWasteValue: number;
  topWasteMenus: { name: string; wasteKg: number }[];
  chartData: { label: string; aktual: number; prakiraan: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .get(`/dashboard?period=${period}`)
      .then((r) => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topMax = data?.topWasteMenus?.[0]?.wasteKg ?? 1;

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Ringkasan Eksekutif</h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground mb-1">
              Total Limbah (Bulan Ini)
            </div>
            <div className="text-2xl font-semibold">
              {data?.totalWasteKg ?? "—"} kg
            </div>
            <div
              className={`text-xs mt-1 ${(data?.wasteVsLastMonth ?? 0) > 0 ? "text-red-500" : "text-emerald-600"}`}
            >
              {(data?.wasteVsLastMonth ?? 0) > 0 ? "+" : ""}
              {data?.wasteVsLastMonth ?? 0}% vs bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground mb-1">
              Prakiraan Akurasi
            </div>
            <div className="text-2xl font-semibold">
              {data?.forecastAccuracy ? `${data.forecastAccuracy}%` : "—"}
            </div>
            {data?.forecastAccuracy ? (
              <div
                className={`text-xs mt-1 ${(data?.accuracyVsTarget ?? 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {(data?.accuracyVsTarget ?? 0) >= 0 ? "+" : ""}
                {data?.accuracyVsTarget}% vs target
              </div>
            ) : (
              <div className="text-xs mt-1 text-muted-foreground">
                Belum ada data forecast
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground mb-1">
              Estimasi Nilai Limbah
            </div>
            <div className="text-2xl font-semibold">
              {data ? formatRupiah(data.estimatedWasteValue) : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Berdasarkan HPP menu × sisa produksi
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Top Waste */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tren Limbah vs Prakiraan Permintaan
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant={period === "weekly" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPeriod("weekly")}
              >
                Mingguan
              </Button>
              <Button
                variant={period === "monthly" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPeriod("monthly")}
              >
                Bulanan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(data?.chartData?.length ?? 0) === 0 ? (
              <div className="h-55 flex items-center justify-center text-sm text-muted-foreground">
                Belum ada data untuk ditampilkan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.chartData ?? []}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="aktual"
                    name="Limbah Aktual"
                    fill="#0F6E56"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="prakiraan"
                    name="Prakiraan"
                    fill="#B2D8CE"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Menu Limbah Teratas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.topWasteMenus?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada data limbah.
              </p>
            ) : (
              data?.topWasteMenus.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.wasteKg} kg
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(item.wasteKg / topMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
