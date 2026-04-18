import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Gunakan recharts (sudah termasuk di Next.js) atau chart library pilihan Anda
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { time: "08:00", value: 30 },
  { time: "10:00", value: 25 },
  { time: "12:00", value: 40 },
  { time: "14:00", value: 35 },
  { time: "16:00", value: 55 },
  { time: "18:00", value: 70 },
  { time: "20:00", value: 50 },
];

export default function WasteTrendChart() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-0">
        <div>
          <CardTitle className="text-lg font-semibold text-[#1a2e1a]">
            Tren Limbah
          </CardTitle>
          <CardDescription>Analisis varians per jam</CardDescription>
        </div>
        <Select defaultValue="24jam">
          <SelectTrigger className="w-[160px] rounded-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24jam">24 Jam Terakhir</SelectItem>
            <SelectItem value="7hari">7 Hari</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1a2e1a"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
