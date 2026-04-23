import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  /** Mode tablet besar untuk Entri Data Staff */
  large?: boolean;
}

export function NumericStepper({
  value,
  onChange,
  min = 0,
  max = 9999,
  large = false,
}: Props) {
  const btn = large
    ? "w-12 h-12 rounded-lg flex items-center justify-center bg-secondary hover:bg-muted border text-foreground active:scale-95 transition"
    : "w-7 h-7 rounded flex items-center justify-center bg-secondary hover:bg-muted border text-foreground transition";

  const num = large
    ? "w-16 text-center text-xl font-semibold"
    : "w-10 text-center text-sm font-medium";

  return (
    <div className="flex items-center gap-2">
      <button
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus size={large ? 18 : 12} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className={cn(
          num,
          "border rounded p-1 focus:outline-none focus:ring-1 focus:ring-primary",
        )}
      />
      <button
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus size={large ? 18 : 12} />
      </button>
    </div>
  );
}
