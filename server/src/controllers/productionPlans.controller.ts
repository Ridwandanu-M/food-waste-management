import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";
import { PlanStatus } from "../generated/prisma/enums";

/**
 * Sama dengan di forecasts.controller — midnight UTC dari tanggal lokal.
 * Dipisah agar tidak ada circular dependency antar controller.
 */
function getLocalToday(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  return new Date(Date.UTC(year, month, day));
}

const planSchema = z.object({
  menuId: z.string(),
  targetDate: z.string(),
  predictedAmount: z.number(),
  plannedAmount: z.number(),
  warningStatus: z.enum(["AMAN", "RISIKO_TINGGI"]),
  status: z.nativeEnum(PlanStatus),
});

const bulkSchema = z.object({
  plans: z.array(planSchema).min(1),
});

export async function getTodayPlans(
  _req: AuthRequest,
  res: Response,
): Promise<void> {
  const today = getLocalToday();

  const plans = await prisma.productionPlan.findMany({
    where: { targetDate: today },
    include: { menu: true },
  });

  res.json(plans);
}

export async function bulkUpsertPlans(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const { plans } = bulkSchema.parse(req.body);
  const managerId = req.user!.id;

  // Gunakan getLocalToday() — abaikan jam yang dikirim frontend
  // agar selalu tersimpan sebagai tanggal hari ini yang benar
  const today = getLocalToday();

  const result = await prisma.$transaction(
    plans.map((p) =>
      prisma.productionPlan.upsert({
        where: {
          menuId_targetDate: {
            menuId: p.menuId,
            targetDate: today, // ← selalu pakai today dari server, bukan dari request
          },
        },
        update: {
          plannedAmount: p.plannedAmount,
          warningStatus: p.warningStatus,
          status: p.status,
        },
        create: {
          menuId: p.menuId,
          targetDate: today,
          predictedAmount: p.predictedAmount,
          plannedAmount: p.plannedAmount,
          warningStatus: p.warningStatus,
          status: p.status,
          managerId,
        },
      }),
    ),
  );

  res.status(201).json(result);
}
