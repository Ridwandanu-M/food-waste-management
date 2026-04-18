import { Leaf } from "lucide-react";

export default function EfficiencyCard() {
  return (
    <div className="rounded-2xl bg-[#1a2e1a] p-6 text-white">
      <Leaf className="h-6 w-6 text-green-400 mb-3" />
      <h2 className="text-xl font-bold">Peringkat Efisiensi</h2>
      <p className="mt-2 text-sm text-green-200 leading-relaxed">
        Penyelarasan produksi Anda saat ini adalah{" "}
        <span className="font-bold text-white">Sangat Baik</span> dibandingkan
        dengan tolok ukur industri.
      </p>
      <p className="mt-6 text-6xl font-bold tracking-tight">94,2%</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-green-400">
        Skor Akurasi
      </p>
    </div>
  );
}
