import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { predictBulk, checkMLHealth, PredictRequest } from "../lib/mlClient";

/**
 * Membuat objek Date yang merepresentasikan awal hari ini
 * dalam timezone lokal server (bukan UTC), lalu diset ke UTC midnight
 * agar cocok dengan cara PostgreSQL @db.Date menyimpan data.
 */
function getLocalToday(): Date {
  const now = new Date();
  // Ambil komponen tanggal lokal
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  // Buat Date baru dari komponen lokal — ini adalah midnight UTC yang benar
  return new Date(Date.UTC(year, month, day));
}

export async function getTodayForecasts(
  _req: Request,
  res: Response,
): Promise<void> {
  const today = getLocalToday();

  // ── 1. Cache check ────────────────────────────────────────────────────────
  const cached = await prisma.forecastResult.findMany({
    where: { targetDate: today },
    include: { menu: true },
  });

  if (cached.length > 0) {
    // Bulatkan predictedDemand sebelum return
    res.json(
      cached.map((f) => ({
        ...f,
        predictedDemand: Math.round(f.predictedDemand),
      })),
    );
    return;
  }

  // ── 2. Siapkan data historis ──────────────────────────────────────────────
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const [menus, allRecords] = await Promise.all([
    prisma.menu.findMany({ where: { isActive: true } }),
    prisma.dailyRecord.findMany({
      where: { date: { gte: ninetyDaysAgo } },
      orderBy: { date: "asc" },
    }),
  ]);

  const recordsByMenu: Record<string, typeof allRecords> = {};
  for (const r of allRecords) {
    if (!recordsByMenu[r.menuId]) recordsByMenu[r.menuId] = [];
    recordsByMenu[r.menuId].push(r);
  }

  const targetDateStr = today.toISOString().split("T")[0];

  // ── 3. Coba panggil ML Service ────────────────────────────────────────────
  const mlAvailable = await checkMLHealth();

  if (mlAvailable) {
    try {
      const requests: PredictRequest[] = menus.map((menu) => ({
        menuId: menu.id,
        menuName: menu.name,
        targetDate: targetDateStr,
        history: (recordsByMenu[menu.id] ?? []).map((r) => ({
          date: r.date.toISOString().split("T")[0],
          actualProduction: r.actualProduction,
          actualSales: r.actualSales,
          wasteAmount: r.wasteAmount,
        })),
      }));

      const mlResponse = await predictBulk(requests, targetDateStr);

      // ── 4. Simpan ke ForecastResult — bulatkan sebelum simpan ─────────────
      await prisma.$transaction(
        mlResponse.predictions.map((p) =>
          prisma.forecastResult.upsert({
            where: {
              menuId_targetDate: {
                menuId: p.menuId,
                targetDate: today,
              },
            },
            update: {
              predictedDemand: Math.round(p.predictedDemand),
              confidenceLevel: p.confidenceLevel,
              insight: p.insight ?? undefined,
            },
            create: {
              menuId: p.menuId,
              targetDate: today,
              predictedDemand: Math.round(p.predictedDemand),
              confidenceLevel: p.confidenceLevel,
              insight: p.insight ?? undefined,
            },
          }),
        ),
      );

      const result = await prisma.forecastResult.findMany({
        where: { targetDate: today },
        include: { menu: true },
      });

      res.json(
        result.map((f) => ({
          ...f,
          predictedDemand: Math.round(f.predictedDemand),
        })),
      );
      return;
    } catch (err) {
      console.error("ML Service error, menggunakan fallback:", err);
    }
  }

  // ── 5. Fallback: rata-rata bergerak 7 hari ────────────────────────────────
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const recentRecords = allRecords.filter((r) => r.date >= sevenDaysAgo);
  const recentByMenu: Record<string, typeof allRecords> = {};
  for (const r of recentRecords) {
    if (!recentByMenu[r.menuId]) recentByMenu[r.menuId] = [];
    recentByMenu[r.menuId].push(r);
  }

  const fallback = menus.map((menu) => {
    const records = recentByMenu[menu.id] ?? [];
    const avgProduction =
      records.length > 0
        ? Math.round(
            records.reduce((s, r) => s + r.actualProduction, 0) /
              records.length,
          )
        : 50;

    return {
      id: `fallback-${menu.id}`,
      targetDate: today.toISOString(),
      predictedDemand: avgProduction, // sudah integer karena Math.round di atas
      confidenceLevel:
        records.length >= 7 ? 0.65 : records.length > 0 ? 0.5 : 0.3,
      insight:
        records.length > 0
          ? `[Fallback] Rata-rata ${records.length} hari terakhir. ML Service tidak tersedia.`
          : "[Fallback] Belum ada data historis. ML Service tidak tersedia.",
      menuId: menu.id,
      createdAt: new Date().toISOString(),
      menu,
    };
  });

  res.json(fallback);
}

export async function deleteAllForecasts(
  _req: Request,
  res: Response,
): Promise<void> {
  await prisma.forecastResult.deleteMany();
  res.json({ message: "Semua data forecast berhasil dihapus." });
}
