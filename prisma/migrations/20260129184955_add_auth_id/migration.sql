/*
  Warnings:

  - A unique constraint covering the columns `[auth_id]` on the table `consultants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "consultants" ADD COLUMN     "auth_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "consultants_auth_id_key" ON "consultants"("auth_id");
