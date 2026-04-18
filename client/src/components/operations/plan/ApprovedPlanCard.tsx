import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

const planItems = [
  {
    icon: "🍽️",
    name: "Braised Beef Short Rib",
    batch: "#4492",
    target: 120,
    unit: "unit",
  },
  {
    icon: "🍄",
    name: "Wild Mushroom Risotto",
    batch: "#4495",
    target: 85,
    unit: "unit",
  },
  {
    icon: "🍅",
    name: "Roasted Tomato Soup",
    batch: "#4498",
    target: 200,
    unit: "porsi",
  },
];

export default function ApprovedPlanCard() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardContent className="p-5">
          <h2 className="text-lg font-bold text-green-700 mb-4">
            Rencana Disetujui
          </h2>
          <div className="space-y-3">
            {planItems.map((item) => (
              <div
                key={item.batch}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1a2e1a]">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID Batch: {item.batch}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Target
                  </p>
                  <p className="text-2xl font-bold text-[#1a2e1a] leading-tight">
                    {item.target}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Keberlanjutan */}
      <div className="rounded-2xl bg-[#1a2e1a] p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-green-400" />
          <p className="text-sm font-bold">Target Keberlanjutan</p>
        </div>
        <p className="text-sm text-green-200 leading-relaxed">
          Target pengurangan limbah hari ini adalah{" "}
          <span className="font-bold text-white">12% di bawah</span> rata-rata
          minggu lalu. Diperlukan presisi tinggi dalam persiapan Beef Short Rib.
        </p>
      </div>
    </div>
  );
}
