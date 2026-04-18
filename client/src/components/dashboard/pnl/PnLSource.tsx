import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Overproduksi", value: 75, color: "#1a2e1a" },
  { name: "Stok Kedaluwarsa", value: 20, color: "#4a7c4a" },
  { name: "Lainnya", value: 5, color: "#c8d8c8" },
];

export default function PnLSource() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold text-[#1a2e1a]">
          Asal Laba/Rugi
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4 pt-4">
        <div className="relative h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={38}
                outerRadius={56}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground">TOTAL</span>
            <span className="text-sm font-bold">100%</span>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {item.name} ({item.value}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
