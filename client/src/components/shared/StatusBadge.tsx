import { cn } from "@/lib/utils";

type Variant =
  | "aktif"
  | "nonaktif"
  | "draft"
  | "disetujui"
  | "diarsipkan"
  | "aman"
  | "risiko";

const styles: Record<Variant, string> = {
  aktif: "bg-emerald-100 text-emerald-700",
  nonaktif: "bg-red-100 text-red-600",
  draft: "bg-gray-100 text-gray-600",
  disetujui: "bg-emerald-100 text-emerald-700",
  diarsipkan: "bg-gray-100 text-gray-500",
  aman: "bg-emerald-100 text-emerald-700",
  risiko: "bg-red-100 text-red-600",
};

const labels: Record<Variant, string> = {
  aktif: "● Aktif",
  nonaktif: "● Nonaktif",
  draft: "Draft",
  disetujui: "Disetujui",
  diarsipkan: "● Diarsipkan",
  aman: "✓ Aman",
  risiko: "⚠ Risiko Limbah Tinggi",
};

export function StatusBadge({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium",
        styles[variant],
        className,
      )}
    >
      {labels[variant]}
    </span>
  );
}
