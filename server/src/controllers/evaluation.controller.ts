import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { evaluateModel } from "../lib/mlClient";

/**
 * GET /api/reports/model-evaluation
 *
 * Mengambil seluruh DailyRecord dari DB, mengirimnya ke ML service
 * untuk dievaluasi dengan walk-forward validation, lalu mengembalikan
 * metrik akurasi per menu dan keseluruhan.
 *
 * Query params:
 *   testDays  - jumlah hari terakhir untuk test set (default: 7)
 *   menuId    - filter per menu (opsional)
 */
export async function getModelEvaluation(
  req: Request,
  res: Response,
): Promise<void> {
  const testDays = parseInt(
    typeof req.query.testDays === "string" ? req.query.testDays : "7",
  );
  const menuId =
    typeof req.query.menuId === "string" && req.query.menuId !== "ALL"
      ? req.query.menuId
      : undefined;

  // Ambil semua menu aktif + seluruh DailyRecord historis
  const [menus, allRecords] = await Promise.all([
    prisma.menu.findMany({
      where: {
        isActive: true,
        ...(menuId ? { id: menuId } : {}),
      },
      select: { id: true, name: true },
    }),
    prisma.dailyRecord.findMany({
      where: {
        ...(menuId ? { menuId } : {}),
      },
      orderBy: { date: "asc" },
    }),
  ]);

  // Group records per menuId
  const recordsByMenu: Record<string, typeof allRecords> = {};
  for (const r of allRecords) {
    if (!recordsByMenu[r.menuId]) recordsByMenu[r.menuId] = [];
    recordsByMenu[r.menuId].push(r);
  }

  // Susun request untuk ML service
  const menuRequests = menus.map((menu) => ({
    menuId: menu.id,
    menuName: menu.name,
    history: (recordsByMenu[menu.id] ?? []).map((r) => ({
      date: r.date.toISOString().split("T")[0],
      actualProduction: r.actualProduction,
      actualSales: r.actualSales,
      wasteAmount: r.wasteAmount,
    })),
  }));

  try {
    const result = await evaluateModel(menuRequests, testDays);
    res.json(result);
  } catch (err) {
    console.error("Evaluasi model gagal:", err);
    res.status(503).json({
      message: "ML Service tidak tersedia. Pastikan ml-service berjalan.",
    });
  }
}
