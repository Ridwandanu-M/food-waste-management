// src/components/dashboard/impact/HighImpactItems.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const items = [
  {
    icon: "🍞",
    name: "Roti Artisan",
    sub: "SURPLUS HARIAN",
    value: "-Rp 700.000",
    change: "+15%",
    changeColor: "text-green-600",
    valueColor: "text-red-600",
  },
  {
    icon: "🥛",
    name: "Susu Organik",
    sub: "SEGERA KEDALUWARSA",
    value: "-Rp 188.000",
    change: "-2.1%",
    changeColor: "text-red-500",
    valueColor: "text-red-600",
  },
];

export default function HighImpactItems() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#1a2e1a]">
          Item Berdampak Tinggi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#1a2e1a]">
                  {item.name}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {item.sub}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${item.valueColor}`}>
                {item.value}
              </p>
              <p className={`text-xs font-medium ${item.changeColor}`}>
                {item.change}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
