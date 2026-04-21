import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const period = req.query.period === 'weekly' ? 7 : 30
  const now = new Date()

  const startCurrent = new Date(now)
  startCurrent.setDate(now.getDate() - period)
  startCurrent.setHours(0, 0, 0, 0)

  const startPrev = new Date(startCurrent)
  startPrev.setDate(startPrev.getDate() - period)

  // Records periode ini
  const currentRecords = await prisma.dailyRecord.findMany({
    where: { date: { gte: startCurrent } },
    include: { menu: true },
  })

  // Records periode sebelumnya (untuk perbandingan)
  const prevRecords = await prisma.dailyRecord.findMany({
    where: { date: { gte: startPrev, lt: startCurrent } },
  })

  // Total limbah
  const totalWasteKg = currentRecords.reduce((s, r) => s + r.wasteAmount, 0)
  const prevWasteKg = prevRecords.reduce((s, r) => s + r.wasteAmount, 0)
  const wasteVsLastMonth =
    prevWasteKg > 0
      ? Math.round(((totalWasteKg - prevWasteKg) / prevWasteKg) * 100)
      : 0

  // Estimasi nilai limbah (wasteAmount × baseCost per menu)
  const estimatedWasteValue = currentRecords.reduce(
    (s, r) => s + r.wasteAmount * (r.menu?.baseCost ?? 0),
    0
  )

  // Top waste menus
  const wasteByMenu: Record<string, { name: string; wasteKg: number }> = {}
  for (const r of currentRecords) {
    if (!wasteByMenu[r.menuId]) {
      wasteByMenu[r.menuId] = { name: r.menu?.name ?? r.menuId, wasteKg: 0 }
    }
    wasteByMenu[r.menuId].wasteKg += r.wasteAmount
  }
  const topWasteMenus = Object.values(wasteByMenu)
    .sort((a, b) => b.wasteKg - a.wasteKg)
    .slice(0, 5)
    .map((m) => ({ ...m, wasteKg: Math.round(m.wasteKg) }))

  // Chart data — group by date
  const chartMap: Record<string, { aktual: number; prakiraan: number }> = {}
  for (const r of currentRecords) {
    const label = new Date(r.date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    })
    if (!chartMap[label]) chartMap[label] = { aktual: 0, prakiraan: 0 }
    chartMap[label].aktual += r.wasteAmount
  }

  // Ambil forecast jika ada untuk ditampilkan sebagai prakiraan di chart
  const forecasts = await prisma.forecastResult.findMany({
    where: { targetDate: { gte: startCurrent } },
  })
  for (const f of forecasts) {
    const label = new Date(f.targetDate).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    })
    if (chartMap[label]) chartMap[label].prakiraan = f.predictedDemand
  }

  const chartData = Object.entries(chartMap).map(([label, v]) => ({
    label,
    aktual: Math.round(v.aktual),
    prakiraan: Math.round(v.prakiraan),
  }))

  // Forecast accuracy — rata-rata jika ada data
  const forecastAccuracy = 94.8 // placeholder sampai ML service aktif
  const accuracyVsTarget = 1.5

  res.json({
    totalWasteKg: Math.round(totalWasteKg),
    wasteVsLastMonth,
    forecastAccuracy,
    accuracyVsTarget,
    estimatedWasteValue: Math.round(estimatedWasteValue),
    topWasteMenus,
    chartData,
  })
}
