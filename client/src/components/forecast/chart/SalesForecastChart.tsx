import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const data = [
  { hari: "SEN", prediksi: 400, historis: 380 },
  { hari: "SEL", prediksi: 550, historis: 500 },
  { hari: "RAB", prediksi: 700, historis: 650 },
  { hari: "KAM", prediksi: 900, historis: 820 },
  { hari: "JUM", prediksi: 1240, historis: 980 },
  { hari: "SAB", prediksi: 1100, historis: 970 },
  { hari: "MIN", prediksi: 950, historis: 900 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#1a2e1a] p-3 text-white shadow-lg text-xs w-44">
        <p className="font-bold mb-2">Prediksi {label}</p>
        <div className="flex justify-between">
          <span>Diprediksi:</span>
          <span className="font-bold text-green-300">
            {payload[0]?.value?.toLocaleString()} unit
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Rata-rata Historis:</span>
          <span>{payload[1]?.value?.toLocaleString()} unit</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SalesForecastChart() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-0">
        <div>
          <CardTitle className="text-lg font-semibold text-[#1a2e1a]">
            Peramalan Volume Penjualan
          </CardTitle>
          <CardDescription>Prediksi vs. Performa Historis</CardDescription>
        </div>
        <Button
          size="sm"
          className="rounded-full bg-[#1a2e1a] text-white hover:bg-[#2d4a2d] gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Buat Peramalan
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <XAxis
              dataKey="hari"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="prediksi"
              stroke="#1a2e1a"
              strokeWidth={2.5}
              dot={false}
              name="Prediksi"
            />
            <Line
              type="monotone"
              dataKey="historis"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              name="Historis"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full bg-[#1a2e1a] inline-block" />
            Prediksi Masa Depan
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 rounded-full bg-gray-400 inline-block border-dashed" />
            Penjualan Historis
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
