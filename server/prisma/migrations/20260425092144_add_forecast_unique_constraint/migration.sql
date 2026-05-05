/*
  Warnings:

  - A unique constraint covering the columns `[menuId,targetDate]` on the table `forecast_results` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "forecast_results_menuId_targetDate_key" ON "forecast_results"("menuId", "targetDate");
