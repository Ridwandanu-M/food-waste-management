/*
  Warnings:

  - The primary key for the `DailyRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ForecastResult` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Menu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProductionPlan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[menuId,date,staffId]` on the table `DailyRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DailyRecord" DROP CONSTRAINT "DailyRecord_menuId_fkey";

-- DropForeignKey
ALTER TABLE "DailyRecord" DROP CONSTRAINT "DailyRecord_staffId_fkey";

-- DropForeignKey
ALTER TABLE "ForecastResult" DROP CONSTRAINT "ForecastResult_menuId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionPlan" DROP CONSTRAINT "ProductionPlan_managerId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionPlan" DROP CONSTRAINT "ProductionPlan_menuId_fkey";

-- DropIndex
DROP INDEX "DailyRecord_date_menuId_key";

-- AlterTable
ALTER TABLE "DailyRecord" DROP CONSTRAINT "DailyRecord_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "menuId" SET DATA TYPE TEXT,
ALTER COLUMN "staffId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DailyRecord_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DailyRecord_id_seq";

-- AlterTable
ALTER TABLE "ForecastResult" DROP CONSTRAINT "ForecastResult_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "menuId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ForecastResult_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ForecastResult_id_seq";

-- AlterTable
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Menu_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Menu_id_seq";

-- AlterTable
ALTER TABLE "ProductionPlan" DROP CONSTRAINT "ProductionPlan_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "menuId" SET DATA TYPE TEXT,
ALTER COLUMN "managerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProductionPlan_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProductionPlan_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateIndex
CREATE INDEX "DailyRecord_menuId_date_idx" ON "DailyRecord"("menuId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecord_menuId_date_staffId_key" ON "DailyRecord"("menuId", "date", "staffId");

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastResult" ADD CONSTRAINT "ForecastResult_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionPlan" ADD CONSTRAINT "ProductionPlan_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionPlan" ADD CONSTRAINT "ProductionPlan_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
