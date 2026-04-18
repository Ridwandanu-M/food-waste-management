import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Card 1 */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Total Limbah Hari Ini
          </p>
          <p className="mt-3 text-5xl font-bold text-[#1a2e1a]">
            142.8
            <span className="ml-1 text-2xl font-normal">kg</span>
          </p>
          <p className="mt-2 flex items-center gap-1 text-sm font-medium text-red-500">
            <TrendingUp className="h-4 w-4" />
            4.2% vs rata-rata
          </p>
        </CardContent>
      </Card>

      {/* Card 2 */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Potensi Kerugian Terhemat
          </p>
          <p className="mt-3 text-4xl font-bold text-[#1a2e1a]">
            Rp 37.500.000
          </p>
          <p className="mt-2 flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingDown className="h-4 w-4" />
            12.5% reduksi
          </p>
        </CardContent>
      </Card>

      {/* Card 3 */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Stok Pengaman Saat Ini
          </p>
          <p className="mt-3 text-5xl font-bold text-[#1a2e1a]">94%</p>
          <Progress
            value={94}
            className="mt-3 h-2 bg-gray-100 [&>div]:bg-[#1a2e1a]"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Level optimal dipertahankan
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
