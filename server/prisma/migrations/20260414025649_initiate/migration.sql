/*
  Warnings:

  - You are about to drop the `media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payload_kv` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payload_locked_documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payload_locked_documents_rels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payload_migrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payload_preferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payload_preferences_rels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'APPROVED');

-- DropForeignKey
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";

-- DropForeignKey
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_parent_fk";

-- DropForeignKey
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_users_fk";

-- DropForeignKey
ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_parent_fk";

-- DropForeignKey
ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_users_fk";

-- DropForeignKey
ALTER TABLE "users_sessions" DROP CONSTRAINT "users_sessions_parent_id_fk";

-- DropTable
DROP TABLE "media";

-- DropTable
DROP TABLE "payload_kv";

-- DropTable
DROP TABLE "payload_locked_documents";

-- DropTable
DROP TABLE "payload_locked_documents_rels";

-- DropTable
DROP TABLE "payload_migrations";

-- DropTable
DROP TABLE "payload_preferences";

-- DropTable
DROP TABLE "payload_preferences_rels";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "users_sessions";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "baseCost" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRecord" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "actualProduction" DOUBLE PRECISION NOT NULL,
    "actualSales" DOUBLE PRECISION NOT NULL,
    "wasteAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,

    CONSTRAINT "DailyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastResult" (
    "id" SERIAL NOT NULL,
    "targetDate" DATE NOT NULL,
    "predictedDemand" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuId" INTEGER NOT NULL,

    CONSTRAINT "ForecastResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionPlan" (
    "id" SERIAL NOT NULL,
    "targetDate" DATE NOT NULL,
    "predictedAmount" DOUBLE PRECISION NOT NULL,
    "plannedAmount" DOUBLE PRECISION NOT NULL,
    "warningStatus" TEXT NOT NULL DEFAULT 'AMAN',
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "menuId" INTEGER NOT NULL,
    "managerId" INTEGER,

    CONSTRAINT "ProductionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecord_date_menuId_key" ON "DailyRecord"("date", "menuId");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastResult_targetDate_menuId_key" ON "ForecastResult"("targetDate", "menuId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionPlan_targetDate_menuId_key" ON "ProductionPlan"("targetDate", "menuId");

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
