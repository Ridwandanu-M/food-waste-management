import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const period = req.query.period === "weekly" ? 7 : 30;
  const now = new Date();

  const startCurrent = new Date(now);
  startCurrent.setDate(now.getDate() - period);
  startCurrent.setHours(0, 0, 0, 0);

  const startPrev = new Date(startCurrent);
  startPrev.setDate(startPrev.getDate() - period);

  // ── Records periode ini & sebelumnya ────────────────────────────────────
  const [currentRecords, prevRecords, forecasts] = await Promise.all([
    prisma.dailyRecord.findMany({
      where: { date: { gte: startCurrent } },
      include: { menu: true },
    }),
    prisma.dailyRecord.findMany({
      where: { date: { gte: startPrev, lt: startCurrent } },
    }),
    prisma.forecastResult.findMany({
      where: { targetDate: { gte: startCurrent } },
      include: { menu: true },
    }),
  ]);

  // ── Total limbah & perbandingan ─────────────────────────────────────────
  const totalWasteKg = currentRecords.reduce((s, r) => s + r.wasteAmount, 0);
  const prevWasteKg = prevRecords.reduce((s, r) => s + r.wasteAmount, 0);
  const wasteVsLastMonth =
    prevWasteKg > 0
      ? Math.round(((totalWasteKg - prevWasteKg) / prevWasteKg) * 100)
      : 0;

  // ── Estimasi nilai limbah ───────────────────────────────────────────────
  const estimatedWasteValue = currentRecords.reduce(
    (s, r) => s + r.wasteAmount * (r.menu?.baseCost ?? 0),
    0,
  );

  // ── Forecast accuracy (real) ────────────────────────────────────────────
  // Bandingkan predictedDemand dari ForecastResult dengan actualProduction
  // dari DailyRecord pada tanggal yang sama per menu
  let forecastAccuracy = 0;
  let accuracyVsTarget = 0;

  if (forecasts.length > 0) {
    const accuracyList: number[] = [];

    for (const f of forecasts) {
      const targetDateStr = new Date(f.targetDate).toDateString();
      const actual = currentRecords.find(
        (r) =>
          r.menuId === f.menuId &&
          new Date(r.date).toDateString() === targetDateStr,
      );
      if (actual && actual.actualProduction > 0) {
        const diff = Math.abs(f.predictedDemand - actual.actualProduction);
        const accuracy = Math.max(
          0,
          100 - (diff / actual.actualProduction) * 100,
        );
        accuracyList.push(accuracy);
      }
    }

    if (accuracyList.length > 0) {
      forecastAccuracy =
        Math.round(
          (accuracyList.reduce((a, b) => a + b, 0) / accuracyList.length) * 10,
        ) / 10;
      // Target akurasi default 90%
      accuracyVsTarget = Math.round((forecastAccuracy - 90) * 10) / 10;
    }
  }

  // ── Top waste menus (dalam satuan unit berdasarkan menu.unit) ───────────
  const wasteByMenu: Record<string, { name: string; unit: string; waste: number }> = {};
  for (const r of currentRecords) {
    if (!wasteByMenu[r.menuId]) {
      wasteByMenu[r.menuId] = {
        name: r.menu?.name ?? r.menuId,
        unit: r.menu?.unit ?? "unit",
        waste: 0
      };
    }
    wasteByMenu[r.menuId].waste += r.wasteAmount;
  }
  const topWasteMenus = Object.values(wasteByMenu)
    .sort((a, b) => b.waste - a.waste)
    .slice(0, 5)
    .map((m) => ({ ...m, waste: Math.round(m.waste * 10) / 10 }));

  // ── Chart data ──────────────────────────────────────────────────────────
  // Kumpulkan semua tanggal unik dari records dalam satu pass
  const chartMap: Record<string, { aktual: number; production: number; waste: number }> = {};

  const getLabel = (d: Date) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

  for (const r of currentRecords) {
    const label = getLabel(new Date(r.date));
    if (!chartMap[label]) chartMap[label] = { aktual: 0, production: 0, waste: 0 };
    chartMap[label].production += r.actualProduction;
    chartMap[label].waste += r.wasteAmount;
  }

  // Isi prediksi produksi dari ForecastResult jika ada
  for (const f of forecasts) {
    const label = getLabel(new Date(f.targetDate));
    if (!chartMap[label]) chartMap[label] = { aktual: 0, production: 0, waste: 0 };
    chartMap[label].aktual += Math.round(f.predictedDemand);
  }

  // Sort berdasarkan tanggal kronologis
  const chartData = Object.entries(chartMap).map(([label, v]) => ({
    label,
    'Produksi Aktual': Math.round(v.aktual),
    'Produksi (Prediksi)': Math.round(v.production),
    'Limbah Aktual': Math.round(v.waste),
  }));

  //───────────────
  // Chart data (sudah dihitung di atas)
  //───────────────

  res.json({
    totalWasteKg: Math.round(totalWasteKg * 10) / 10,
    wasteVsLastMonth,
    forecastAccuracy,
    accuracyVsTarget,
    estimatedWasteValue: Math.round(estimatedWasteValue),
    topWasteMenus,
    chartData,
  });
}
