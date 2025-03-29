/*
  Warnings:

  - The values [doctor,assistant,patient] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.
  - The values [created,approved,declined] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [appointments,patientTreatments] on the enum `CommentEntityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [monday,tuesday,wednesday,thursday,friday,sunday] on the enum `DayOfWeek` will be removed. If these variants are still used in the database, this will fail.
  - The values [photo,avatar,document,contract] on the enum `FileType` will be removed. If these variants are still used in the database, this will fail.
  - The values [before,after] on the enum `PhotoPhase` will be removed. If these variants are still used in the database, this will fail.
  - The values [admin,user] on the enum `RoleType` will be removed. If these variants are still used in the database, this will fail.
  - The values [system,comments] on the enum `SystemLogEntityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [completed,in_progress,canceled,scheduled] on the enum `TreatmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('DOCTOR', 'ASSISTANT', 'PATIENT');
ALTER TABLE "users" ALTER COLUMN "accountType" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "accountType" TYPE "AccountType_new" USING ("accountType"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "AccountType_old";
ALTER TABLE "users" ALTER COLUMN "accountType" SET DEFAULT 'PATIENT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('CREATED', 'APPROVED', 'DECLINED');
ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "AppointmentStatus_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CommentEntityType_new" AS ENUM ('APPOINTMENTS', 'PATIENTTREATMENTS');
ALTER TABLE "comments" ALTER COLUMN "entityType" TYPE "CommentEntityType_new" USING ("entityType"::text::"CommentEntityType_new");
ALTER TYPE "CommentEntityType" RENAME TO "CommentEntityType_old";
ALTER TYPE "CommentEntityType_new" RENAME TO "CommentEntityType";
DROP TYPE "CommentEntityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DayOfWeek_new" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SUNDAY');
ALTER TABLE "schedule_availability" ALTER COLUMN "dayOfWeek" TYPE "DayOfWeek_new" USING ("dayOfWeek"::text::"DayOfWeek_new");
ALTER TYPE "DayOfWeek" RENAME TO "DayOfWeek_old";
ALTER TYPE "DayOfWeek_new" RENAME TO "DayOfWeek";
DROP TYPE "DayOfWeek_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "FileType_new" AS ENUM ('PHOTO', 'AVATAR', 'DOCUMENT', 'CONTRACT');
ALTER TABLE "files" ALTER COLUMN "fileType" TYPE "FileType_new" USING ("fileType"::text::"FileType_new");
ALTER TYPE "FileType" RENAME TO "FileType_old";
ALTER TYPE "FileType_new" RENAME TO "FileType";
DROP TYPE "FileType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PhotoPhase_new" AS ENUM ('BEFORE', 'AFTER');
ALTER TABLE "treatment_photos" ALTER COLUMN "type" TYPE "PhotoPhase_new" USING ("type"::text::"PhotoPhase_new");
ALTER TYPE "PhotoPhase" RENAME TO "PhotoPhase_old";
ALTER TYPE "PhotoPhase_new" RENAME TO "PhotoPhase";
DROP TYPE "PhotoPhase_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RoleType_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "RoleType_new" USING ("role"::text::"RoleType_new");
ALTER TYPE "RoleType" RENAME TO "RoleType_old";
ALTER TYPE "RoleType_new" RENAME TO "RoleType";
DROP TYPE "RoleType_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SystemLogEntityType_new" AS ENUM ('SYSTEM', 'COMMENTS');
ALTER TABLE "system_logs" ALTER COLUMN "entityType" TYPE "SystemLogEntityType_new" USING ("entityType"::text::"SystemLogEntityType_new");
ALTER TYPE "SystemLogEntityType" RENAME TO "SystemLogEntityType_old";
ALTER TYPE "SystemLogEntityType_new" RENAME TO "SystemLogEntityType";
DROP TYPE "SystemLogEntityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TreatmentStatus_new" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'CANCELED', 'SCHEDULED');
ALTER TABLE "patient_treatments" ALTER COLUMN "status" TYPE "TreatmentStatus_new" USING ("status"::text::"TreatmentStatus_new");
ALTER TYPE "TreatmentStatus" RENAME TO "TreatmentStatus_old";
ALTER TYPE "TreatmentStatus_new" RENAME TO "TreatmentStatus";
DROP TYPE "TreatmentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_branch_availability" DROP CONSTRAINT "doctor_branch_availability_branchId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_branch_availability" DROP CONSTRAINT "doctor_branch_availability_doctorId_fkey";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'CREATED';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER',
ALTER COLUMN "accountType" SET DEFAULT 'PATIENT',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE "doctor_branch_availability" ADD CONSTRAINT "doctor_branch_availability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_branch_availability" ADD CONSTRAINT "doctor_branch_availability_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
