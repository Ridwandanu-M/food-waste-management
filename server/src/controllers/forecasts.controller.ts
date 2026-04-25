import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getTodayForecasts(
  _req: Request,
  res: Response,
): Promise<void> {
  // @db.Date di Prisma menyimpan tanggal tanpa waktu —
  // query harus menggunakan midnight UTC agar cocok
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const forecasts = await prisma.forecastResult.findMany({
    where: { targetDate: today },
    include: { menu: true },
  });

  if (forecasts.length > 0) {
    res.json(forecasts);
    return;
  }

  // ── Fallback: rata-rata actualProduction 7 hari terakhir ────────────────
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const menus = await prisma.menu.findMany({ where: { isActive: true } });

  // Ambil semua records 7 hari sekaligus (1 query, bukan N query)
  const recentRecords = await prisma.dailyRecord.findMany({
    where: {
      date: { gte: sevenDaysAgo },
      menu: { isActive: true },
    },
    include: { menu: true },
  });

  // Group records per menuId
  const recordsByMenu: Record<string, typeof recentRecords> = {};
  for (const r of recentRecords) {
    if (!recordsByMenu[r.menuId]) recordsByMenu[r.menuId] = [];
    recordsByMenu[r.menuId].push(r);
  }

  const result = menus.map((menu) => {
    const records = recordsByMenu[menu.id] ?? [];

    const avgProduction =
      records.length > 0
        ? Math.round(
            records.reduce((s, r) => s + r.actualProduction, 0) /
              records.length,
          )
        : 50; // default jika belum ada DailyRecord

    return {
      id: `fallback-${menu.id}`,
      targetDate: today.toISOString(),
      predictedDemand: avgProduction,
      confidenceLevel: records.length > 0 ? 0.75 : 0.3,
      insight:
        records.length > 0
          ? `Prediksi berdasarkan rata-rata ${records.length} hari terakhir. Integrasikan ML untuk akurasi lebih tinggi.`
          : null,
      menuId: menu.id,
      createdAt: new Date().toISOString(),
      menu,
    };
  });

  res.json(result);
}

export async function deleteAllForecasts(
  _req: Request,
  res: Response,
): Promise<void> {
  await prisma.forecastResult.deleteMany();
  res.json({ message: "Semua data forecast berhasil dihapus." });
}
