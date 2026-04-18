"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface ReportItemRowProps {
  name: string;
  unit: string;
  unitNote?: string;
}

function Stepper({
  value,
  onChange,
  highlight,
}: {
  value: number;
  onChange: (v: number) => void;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-muted-foreground hover:border-[#1a2e1a] hover:text-[#1a2e1a] transition-colors"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        className={`w-8 text-center text-2xl font-bold ${
          highlight ? "text-green-600" : "text-[#1a2e1a]"
        }`}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-muted-foreground hover:border-[#1a2e1a] hover:text-[#1a2e1a] transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ReportItemRow({
  name,
  unit,
  unitNote,
}: ReportItemRowProps) {
  const [produksi, setProduksi] = useState(0);
  const [sisa, setSisa] = useState(0);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Info item */}
        <div className="min-w-[140px]">
          <p className="text-base font-bold text-[#1a2e1a]">{name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Satuan: {unit}
            {unitNote && (
              <span className="block text-muted-foreground/70">{unitNote}</span>
            )}
          </p>
        </div>

        {/* Steppers */}
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Produksi Aktual
            </p>
            <Stepper value={produksi} onChange={setProduksi} highlight />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Sisa/Limbah
            </p>
            <Stepper value={sisa} onChange={setSisa} />
          </div>
        </div>
      </div>
    </div>
  );
}
