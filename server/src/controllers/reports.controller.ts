import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * GET /api/reports/forecast-vs-actual
 *
 * Mengembalikan perbandingan:
 *   - plannedAmount (dari ProductionPlan, keputusan Manager)
 *   - predictedDemand (dari ForecastResult, prediksi ML)
 *   - actualProduction (dari DailyRecord, realisasi Staff)
 *   - wasteAmount (dari DailyRecord)
 *   - warningStatus (apakah Manager mengabaikan warning EWS)
 *
 * Query params:
 *   startDate  - ISO date string, default 30 hari lalu
 *   endDate    - ISO date string, default hari ini
 *   menuId     - filter per menu (opsional)
 */
export async function getForecastVsActual(
  req: Request,
  res: Response,
): Promise<void> {
  const now = new Date();

  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : now;

  const startDate = req.query.startDate
    ? new Date(String(req.query.startDate))
    : new Date(new Date().setDate(now.getDate() - 30));

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const menuId =
    typeof req.query.menuId === "string" && req.query.menuId !== "ALL"
      ? req.query.menuId
      : undefined;

  // Ambil semua data yang dibutuhkan secara paralel
  const [plans, forecasts, records, menus] = await Promise.all([
    prisma.productionPlan.findMany({
      where: {
        targetDate: { gte: startDate, lte: endDate },
        ...(menuId ? { menuId } : {}),
      },
      include: { menu: true },
      orderBy: { targetDate: "asc" },
    }),
    prisma.forecastResult.findMany({
      where: {
        targetDate: { gte: startDate, lte: endDate },
        ...(menuId ? { menuId } : {}),
      },
      orderBy: { targetDate: "asc" },
    }),
    prisma.dailyRecord.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(menuId ? { menuId } : {}),
      },
      include: { menu: true },
      orderBy: { date: "asc" },
    }),
    prisma.menu.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Build lookup maps
  type ForecastKey = string; // `${menuId}_${dateStr}`
  const forecastMap = new Map<ForecastKey, number>();
  for (const f of forecasts) {
    const key = `${f.menuId}_${f.targetDate.toISOString().split("T")[0]}`;
    forecastMap.set(key, f.predictedDemand);
  }

  const recordMap = new Map<
    ForecastKey,
    { production: number; waste: number; sales: number }
  >();
  for (const r of records) {
    const key = `${r.menuId}_${r.date.toISOString().split("T")[0]}`;
    const existing = recordMap.get(key);
    if (existing) {
      // Aggregate jika ada multiple staff input untuk menu+tanggal yang sama
      existing.production += r.actualProduction;
      existing.waste += r.wasteAmount;
      existing.sales += r.actualSales;
    } else {
      recordMap.set(key, {
        production: r.actualProduction,
        waste: r.wasteAmount,
        sales: r.actualSales,
      });
    }
  }

  // Susun rows dari ProductionPlan sebagai anchor data
  const rows = plans.map((plan) => {
    const dateStr = plan.targetDate.toISOString().split("T")[0];
    const key = `${plan.menuId}_${dateStr}`;
    const predicted = forecastMap.get(key) ?? null;
    const actual = recordMap.get(key) ?? null;

    const accuracy =
      predicted && actual?.production
        ? Math.max(
            0,
            Math.round(
              (1 -
                Math.abs(predicted - actual.production) / actual.production) *
                100 *
                10,
            ) / 10,
          )
        : null;

    const planAccuracy = actual?.production
      ? Math.max(
          0,
          Math.round(
            (1 -
              Math.abs(plan.plannedAmount - actual.production) /
                actual.production) *
              100 *
              10,
          ) / 10,
        )
      : null;

    return {
      date: dateStr,
      menuId: plan.menuId,
      menuName: plan.menu.name,
      plannedAmount: plan.plannedAmount,
      predictedDemand: predicted,
      actualProduction: actual?.production ?? null,
      wasteAmount: actual?.waste ?? null,
      actualSales: actual?.sales ?? null,
      warningStatus: plan.warningStatus,
      planStatus: plan.status,
      // Akurasi ML: seberapa dekat prediksi vs aktual
      mlAccuracy: accuracy,
      // Akurasi Manager: seberapa dekat keputusan Manager vs aktual
      planAccuracy: planAccuracy,
      // True jika Manager mengabaikan warning EWS
      ignoredWarning:
        plan.warningStatus === "RISIKO_TINGGI" && plan.status === "APPROVED",
    };
  });

  // ── Summary statistics ────────────────────────────────────────────────────
  const rowsWithData = rows.filter((r) => r.actualProduction !== null);

  const avgMlAccuracy =
    rowsWithData.length > 0 && rowsWithData.some((r) => r.mlAccuracy !== null)
      ? Math.round(
          (rowsWithData
            .filter((r) => r.mlAccuracy !== null)
            .reduce((s, r) => s + r.mlAccuracy!, 0) /
            rowsWithData.filter((r) => r.mlAccuracy !== null).length) *
            10,
        ) / 10
      : null;

  const avgPlanAccuracy =
    rowsWithData.length > 0 && rowsWithData.some((r) => r.planAccuracy !== null)
      ? Math.round(
          (rowsWithData
            .filter((r) => r.planAccuracy !== null)
            .reduce((s, r) => s + r.planAccuracy!, 0) /
            rowsWithData.filter((r) => r.planAccuracy !== null).length) *
            10,
        ) / 10
      : null;

  const totalWaste = rowsWithData.reduce((s, r) => s + (r.wasteAmount ?? 0), 0);
  const totalProduction = rowsWithData.reduce(
    (s, r) => s + (r.actualProduction ?? 0),
    0,
  );
  const wasteRate =
    totalProduction > 0
      ? Math.round((totalWaste / totalProduction) * 100 * 10) / 10
      : 0;

  const ignoredWarnings = rows.filter((r) => r.ignoredWarning).length;

  // ── Chart data: agregasi per tanggal ─────────────────────────────────────
  const chartMap = new Map<
    string,
    {
      date: string;
      planned: number;
      predicted: number;
      actual: number;
      waste: number;
      count: number;
    }
  >();

  for (const row of rows) {
    const existing = chartMap.get(row.date);
    if (existing) {
      existing.planned += row.plannedAmount;
      existing.predicted += row.predictedDemand ?? 0;
      existing.actual += row.actualProduction ?? 0;
      existing.waste += row.wasteAmount ?? 0;
      existing.count += 1;
    } else {
      chartMap.set(row.date, {
        date: row.date,
        planned: row.plannedAmount,
        predicted: row.predictedDemand ?? 0,
        actual: row.actualProduction ?? 0,
        waste: row.wasteAmount ?? 0,
        count: 1,
      });
    }
  }

  const chartData = Array.from(chartMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      }),
      Direncanakan: Math.round(d.planned),
      "Prediksi ML": Math.round(d.predicted),
      Aktual: Math.round(d.actual),
      Limbah: Math.round(d.waste),
    }));

  res.json({
    summary: {
      totalRows: rows.length,
      rowsWithData: rowsWithData.length,
      avgMlAccuracy,
      avgPlanAccuracy,
      totalWaste: Math.round(totalWaste * 10) / 10,
      totalProduction: Math.round(totalProduction * 10) / 10,
      wasteRate,
      ignoredWarnings,
    },
    chartData,
    rows,
    menus, // untuk filter dropdown di frontend
  });
}
