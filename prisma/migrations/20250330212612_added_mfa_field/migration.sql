-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prefix" TEXT,
ADD COLUMN     "twoFactorSecret" TEXT;
