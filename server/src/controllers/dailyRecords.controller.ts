import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";

const recordSchema = z.object({
  menuId: z.string(),
  date: z.string(),
  actualProduction: z.number().nonnegative(),
  actualSales: z.number().nonnegative(),
  wasteAmount: z.number().nonnegative(),
});

const bulkSchema = z.object({
  records: z.array(recordSchema),
});

export async function createDailyRecords(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const { records } = bulkSchema.parse(req.body);
  const staffId = req.user!.id;

  const created = await prisma.$transaction(
    records.map((r) =>
      prisma.dailyRecord.upsert({
        where: {
          menuId_date_staffId: {
            menuId: r.menuId,
            date: new Date(r.date),
            staffId,
          },
        },
        update: {
          actualProduction: r.actualProduction,
          actualSales: r.actualSales,
          wasteAmount: r.wasteAmount,
        },
        create: {
          menuId: r.menuId,
          date: new Date(r.date),
          actualProduction: r.actualProduction,
          actualSales: r.actualSales,
          wasteAmount: r.wasteAmount,
          staffId,
        },
      }),
    ),
  );

  res.status(201).json(created);
}
