import { Badge } from "@/components/ui/badge";

export default function DashboardHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#1a2e1a]">
          Andi Pratama
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kecerdasan efisiensi limbah waktu nyata untuk Dapur Sederhana.
        </p>
      </div>
      <Badge
        variant="outline"
        className="flex items-center gap-2 rounded-full border-gray-300 px-4 py-2 text-xs font-medium"
      >
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        UMPAN SISTEM LANGSUNG
      </Badge>
    </div>
  );
}
