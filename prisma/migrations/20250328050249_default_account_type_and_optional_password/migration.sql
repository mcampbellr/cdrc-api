-- AlterTable
ALTER TABLE "users" ALTER COLUMN "accountType" SET DEFAULT 'patient',
ALTER COLUMN "password" DROP NOT NULL;
