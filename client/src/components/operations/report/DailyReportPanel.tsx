"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, UserCircle2 } from "lucide-react";
import ReportItemRow from "./ReportItemRow";

const reportItems = [
  {
    name: "Braised Beef Short Rib",
    unit: "Nampan",
    unitNote: "(sekitar 5 porsi masing-masing)",
  },
  {
    name: "Wild Mushroom Risotto",
    unit: "Liter (L)",
  },
  {
    name: "Roasted Tomato Soup",
    unit: "Porsi",
  },
];

export default function DailyReportPanel() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-bold text-[#1a2e1a]">
          Laporan Akhir Hari
        </CardTitle>
        <Badge
          variant="outline"
          className="rounded-full border-gray-200 px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          Shift Selesai: 16:30
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {reportItems.map((item) => (
          <ReportItemRow
            key={item.name}
            name={item.name}
            unit={item.unit}
            unitNote={item.unitNote}
          />
        ))}

        {/* Submit Button */}
        <button className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1a2e1a] py-4 text-base font-bold text-white transition-opacity hover:opacity-90">
          <Send className="h-4 w-4" />
          Kirim Laporan Harian
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <UserCircle2 className="h-3.5 w-3.5" />
          Mengirim sebagai ID Staf: PRD-772
        </p>
      </CardContent>
    </Card>
  );
}
