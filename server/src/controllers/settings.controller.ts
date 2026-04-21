import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const settingsSchema = z.object({
  restaurantName: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  wasteTolerancePercent: z.number().int().min(1).max(100).optional(),
  notifyDailySummary: z.boolean().optional(),
  notifyWarningEscalation: z.boolean().optional(),
})

export async function getSettings(_req: Request, res: Response): Promise<void> {
  let settings = await prisma.systemSettings.findUnique({ where: { id: 'singleton' } })

  // Auto-create jika belum ada
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { id: 'singleton' },
    })
  }

  res.json({
    restaurantName: settings.restaurantName,
    timezone: settings.timezone,
    currency: settings.currency,
    wasteTolerancePercent: settings.wasteTolerancePercent,
    notifyDailySummary: settings.notifyDailySummary,
    notifyWarningEscalation: settings.notifyWarningEscalation,
  })
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const data = settingsSchema.parse(req.body)

  const settings = await prisma.systemSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })

  res.json({
    restaurantName: settings.restaurantName,
    timezone: settings.timezone,
    currency: settings.currency,
    wasteTolerancePercent: settings.wasteTolerancePercent,
    notifyDailySummary: settings.notifyDailySummary,
    notifyWarningEscalation: settings.notifyWarningEscalation,
  })
}
