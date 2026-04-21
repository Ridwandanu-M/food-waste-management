import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";
import { PlanStatus } from "../generated/prisma/enums";

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const result = await prisma.$transaction(
    plans.map((p) =>
      prisma.productionPlan.upsert({
        where: {
          menuId_targetDate: {
            menuId: p.menuId,
            targetDate: new Date(p.targetDate),
          },
        },
        update: {
          plannedAmount: p.plannedAmount,
          warningStatus: p.warningStatus,
          status: p.status,
        },
        create: {
          menuId: p.menuId,
          targetDate: new Date(p.targetDate),
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
