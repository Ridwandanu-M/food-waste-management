import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getTodayForecasts(
  _req: Request,
  res: Response,
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Cari forecast untuk hari ini
  const forecasts = await prisma.forecastResult.findMany({
    where: { targetDate: today },
    include: { menu: true },
  });

  // Jika belum ada forecast, buat dummy dari rata-rata 7 hari
  if (forecasts.length === 0) {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const menus = await prisma.menu.findMany({ where: { isActive: true } });

    const result = await Promise.all(
      menus.map(async (menu) => {
        const records = await prisma.dailyRecord.findMany({
          where: {
            menuId: menu.id,
            date: { gte: sevenDaysAgo },
          },
        });

        const avgProduction =
          records.length > 0
            ? Math.round(
                records.reduce((s, r) => s + r.actualProduction, 0) /
                  records.length,
              )
            : 50;

        return {
          id: `temp-${menu.id}`,
          targetDate: today.toISOString(),
          predictedDemand: avgProduction,
          confidenceLevel: 0.75,
          insight: null,
          menuId: menu.id,
          createdAt: new Date().toISOString(),
          menu,
        };
      }),
    );

    res.json(result);
    return;
  }

  res.json(forecasts);
}

export async function deleteAllForecasts(
  _req: Request,
  res: Response,
): Promise<void> {
  await prisma.forecastResult.deleteMany();
  res.json({ message: "Semua data forecast berhasil dihapus." });
}
