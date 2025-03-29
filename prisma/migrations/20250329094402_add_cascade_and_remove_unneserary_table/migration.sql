/*
  Warnings:

  - You are about to drop the `doctor_days_off` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "doctor_days_off" DROP CONSTRAINT "doctor_days_off_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_availability" DROP CONSTRAINT "schedule_availability_scheduleId_fkey";

-- DropTable
DROP TABLE "doctor_days_off";

-- AddForeignKey
ALTER TABLE "schedule_availability" ADD CONSTRAINT "schedule_availability_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
