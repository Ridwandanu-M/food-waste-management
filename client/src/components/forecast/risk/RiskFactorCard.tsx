import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, CalendarClock } from "lucide-react";

const risks = [
  {
    icon: <CloudRain className="h-4 w-4 text-orange-400" />,
    title: "Prakiraan Hujan (Jum)",
    impact: "-12% Prediksi kunjungan",
  },
  {
    icon: <CalendarClock className="h-4 w-4 text-[#1a2e1a]" />,
    title: "Konvensi Lokal",
    impact: "+25% Permintaan makan siang",
  },
];

export default function RiskFactorCard() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Faktor Risiko
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map((risk) => (
          <div key={risk.title} className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-gray-100 p-1.5">
              {risk.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a2e1a]">
                {risk.title}
              </p>
              <p className="text-xs text-muted-foreground">{risk.impact}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
