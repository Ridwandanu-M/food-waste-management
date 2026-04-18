import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AlertFeed() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-[#1a2e1a]">
          Aliran Peringatan
        </CardTitle>
        <Badge variant="outline" className="rounded-full text-xs">
          WAKTU NYATA
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert Kritis */}
        <div className="rounded-xl bg-red-50 p-4 border border-red-100">
          <div className="flex justify-between text-xs mb-1">
            <Badge className="bg-red-500 text-white text-[10px] rounded-full">
              PERINGATAN KRITIS
            </Badge>
            <span className="text-muted-foreground">2m yang lalu</span>
          </div>
          <p className="mt-2 text-sm font-bold text-red-700">
            Limbah roti melebihi ambang batas sebesar 15%
          </p>
          <p className="mt-1 text-xs text-red-600">
            Tindakan diperlukan: Sesuaikan prakiraan produksi untuk shift sore.
          </p>
          <Button
            size="sm"
            className="mt-3 h-7 rounded-full bg-red-600 px-3 text-xs text-white hover:bg-red-700"
          >
            MITIGASI SEKARANG
          </Button>
        </div>

        <Separator />

        {/* Alert Sistem */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold uppercase tracking-wide text-muted-foreground">
              Pembaruan Sistem
            </span>
            <span className="text-muted-foreground">15m yang lalu</span>
          </div>
          <p className="text-sm font-semibold text-[#1a2e1a]">
            Sinkronisasi Inventaris Selesai
          </p>
          <p className="text-xs text-muted-foreground">
            Data penyimpanan armada disinkronkan di semua node.
          </p>
        </div>

        <Separator />

        {/* Alert Pencapaian */}
        <div className="space-y-1 border-l-4 border-green-500 pl-3">
          <div className="flex justify-between text-xs">
            <span className="font-semibold uppercase tracking-wide text-muted-foreground">
              Pencapaian Penghematan
            </span>
            <span className="text-muted-foreground">1j yang lalu</span>
          </div>
          <p className="text-sm font-semibold text-[#1a2e1a]">
            Hemat Rp 7.800.000+ periode ini
          </p>
          <p className="text-xs text-muted-foreground">
            Rute donasi cerdas menyelamatkan 45kg barang mudah rusak bernilai
            tinggi.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs uppercase tracking-widest"
        >
          Lihat Arsip Riwayat
        </Button>
      </CardContent>
    </Card>
  );
}
