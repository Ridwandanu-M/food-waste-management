import { CalendarDays } from "lucide-react";

export default function ForecastHeader() {
  return (
    <div className="flex items-start justify-between">
      <div className="max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
          Inteligensi Rantai Pasokan
        </p>
        <h1 className="mt-1 text-4xl font-bold leading-tight tracking-tight text-[#1a2e1a]">
          Peramalan & Optimalisasi <br /> Produksi
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Manfaatkan pemodelan prediktif untuk menyelaraskan hasil dapur dengan
          sinyal permintaan waktu nyata. Kurangi limbah produksi berlebih dengan
          perkiraan <span className="font-semibold text-green-600">18,4%</span>{" "}
          minggu ini.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Periode Saat Ini
          </p>
          <p className="text-sm font-bold text-[#1a2e1a]">Hari Ini: 24 Okt</p>
        </div>
      </div>
    </div>
  );
}
