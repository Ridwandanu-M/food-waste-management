export default function OperationsHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1a2e1a]">
          Lantai Produksi
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight text-[#1a2e1a]">
          Operasional Harian
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Shift: Produksi Pagi | 24 Okt 2023
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[#1a2e1a] shadow-sm">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Sinkronisasi Langsung Aktif
      </div>
    </div>
  );
}
