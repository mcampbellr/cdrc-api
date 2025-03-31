/*
  Warnings:

  - You are about to drop the column `enabled` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "enabled",
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;
