import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { CardSkeleton } from "@/components/shared/PageLoader";
import { ErrorState } from "@/components/shared/ErrorState";
import { toast } from "sonner";
import { TOLERANCE_MIN, TOLERANCE_MAX } from "@/lib/constants";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { SystemSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    restaurantName: "",
    timezone: "Asia/Jakarta",
    currency: "IDR",
    wasteTolerancePercent: 15,
    notifyDailySummary: true,
    notifyWarningEscalation: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchSettings = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .get("/settings")
      .then((r) => setSettings(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function set<K extends keyof SystemSettings>(key: K, val: SystemSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: val }));
  }

  const toleranceWarning =
    settings.wasteTolerancePercent < TOLERANCE_MIN
      ? `⚠ Nilai minimum adalah ${TOLERANCE_MIN}%. Sensitivitas terlalu tinggi dapat memicu terlalu banyak peringatan.`
      : settings.wasteTolerancePercent > TOLERANCE_MAX
        ? `⚠ Nilai maksimum adalah ${TOLERANCE_MAX}%. Toleransi terlalu longgar akan menonaktifkan efektivitas sistem.`
        : null;

  async function handleSave() {
    setSaving(true);
    try {
      await api.put("/settings", settings);
      toast("Pengaturan disimpan", {
        description: "Konfigurasi sistem berhasil diperbarui.",
      });
    } catch {
      toast.error("Gagal menyimpan", {
        description: "Tidak dapat menyimpan pengaturan.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetForecast() {
    setResetting(true);
    try {
      await api.delete("/forecasts/all");
      setConfirmReset(false);
      toast("Data forecast direset", {
        description: "Semua hasil forecast telah dihapus.",
      });
    } catch {
      toast.error("Gagal reset", {
        description: "Tidak dapat menghapus data forecast.",
      });
    } finally {
      setResetting(false);
    }
  }

  if (loading)
    return (
      <div className="max-w-2xl space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );

  if (error) return <ErrorState onRetry={fetchSettings} />;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Pengaturan Sistem</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurasi parameter operasional WasteWise.
        </p>
      </div>

      {/* Profil Restoran */}
      <section className="bg-background border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium">Profil Restoran</h2>
          <p className="text-xs text-muted-foreground">
            Informasi dasar tentang lokasi operasional Anda.
          </p>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nama Restoran</Label>
            <Input
              value={settings.restaurantName}
              onChange={(e) => set("restaurantName", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Zona Waktu</Label>
              <Select
                value={settings.timezone}
                onValueChange={(v) => set("timezone", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Jakarta">
                    Asia/Jakarta (WIB)
                  </SelectItem>
                  <SelectItem value="Asia/Makassar">
                    Asia/Makassar (WITA)
                  </SelectItem>
                  <SelectItem value="Asia/Jayapura">
                    Asia/Jayapura (WIT)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Mata Uang</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) => set("currency", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR — Rupiah Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Parameter EWS */}
      <section className="bg-background border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium">
            Parameter Early Warning System
          </h2>
          <p className="text-xs text-muted-foreground">
            Atur sensitivitas peringatan pencegahan limbah berbasis AI.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Toleransi Risiko Limbah (%)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={settings.wasteTolerancePercent}
              onChange={(e) =>
                set("wasteTolerancePercent", Number(e.target.value))
              }
              className={cn(
                "w-24",
                toleranceWarning
                  ? "border-amber-400 focus-visible:ring-amber-400"
                  : "",
              )}
            />
            <span className="text-muted-foreground text-sm">%</span>
          </div>
          {toleranceWarning && (
            <p className="text-xs text-amber-600">{toleranceWarning}</p>
          )}
          <div className="text-xs text-muted-foreground bg-muted/40 rounded-md p-3 mt-1">
            Jika jumlah rencana produksi melebihi prakiraan AI ditambah
            toleransi ini, sistem akan menampilkan peringatan risiko limbah
            tinggi kepada Manajer.
          </div>
        </div>
      </section>

      {/* Notifikasi */}
      <section className="bg-background border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium">Notifikasi</h2>
          <p className="text-xs text-muted-foreground">
            Kelola preferensi komunikasi sistem.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Kirim ringkasan harian ke Manajer via email</Label>
            <Switch
              checked={settings.notifyDailySummary}
              onCheckedChange={(v) => set("notifyDailySummary", v)}
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label>Eskalasi Peringatan</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Notifikasi jika Manager mengabaikan peringatan AI lebih dari 3
                kali berturut-turut.
              </p>
            </div>
            <Switch
              checked={settings.notifyWarningEscalation}
              onCheckedChange={(v) => set("notifyWarningEscalation", v)}
            />
          </div>
        </div>
      </section>

      {/* Zona Bahaya */}
      <section className="border border-red-200 bg-red-50/30 rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium text-red-600">Zona Bahaya</h2>
          <p className="text-xs text-red-500">
            Tindakan destruktif pada sistem prediksi Anda.
          </p>
        </div>
        <div className="bg-background border border-red-100 rounded-lg p-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Reset Data Forecast</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Tindakan ini akan menghapus semua hasil forecast tersimpan. Data
              produksi harian tidak akan terpengaruh.
            </div>
          </div>
          {!confirmReset ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmReset(true)}
            >
              Reset
            </Button>
          ) : (
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmReset(false)}
                disabled={resetting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetForecast}
                disabled={resetting}
              >
                {resetting ? "Menghapus..." : "Konfirmasi"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end pb-6">
        <Button
          onClick={handleSave}
          disabled={saving || !!toleranceWarning}
          className="gap-2"
        >
          <Save size={14} />
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>
    </div>
  );
}
