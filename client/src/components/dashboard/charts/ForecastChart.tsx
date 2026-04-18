import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { hari: "Sen", historis: 80, prediksi: 85 },
  { hari: "Sel", historis: 90, prediksi: 88 },
  { hari: "Rab", historis: 70, prediksi: 75 },
  { hari: "Kam", historis: 95, prediksi: 100 },
  { hari: "Jum", historis: 110, prediksi: 115 },
  { hari: "Sab", historis: 100, prediksi: 105 },
];

export default function ForecastChart() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-0">
        <div>
          <CardTitle className="text-lg font-semibold text-[#1a2e1a]">
            Visualisasi Forecast
          </CardTitle>
          <CardDescription>
            Volume penjualan historis vs prediksi
          </CardDescription>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
            Historis
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1a2e1a]" />
            Prediksi
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="30%" barGap={4}>
            <XAxis
              dataKey="hari"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "#f5f4f0" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                fontSize: 12,
              }}
            />
            <Bar dataKey="historis" fill="#d1d5db" radius={[4, 4, 0, 0]} />
            <Bar dataKey="prediksi" fill="#1a2e1a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
