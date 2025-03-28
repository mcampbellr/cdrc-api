/*
  Warnings:

  - You are about to drop the `days_of_schedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "days_of_schedule" DROP CONSTRAINT "days_of_schedule_scheduleId_fkey";

-- DropTable
DROP TABLE "days_of_schedule";

-- CreateTable
CREATE TABLE "doctor_days_off" (
    "id" TEXT NOT NULL,
    "dateOf" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "allDay" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "scheduleId" TEXT NOT NULL,

    CONSTRAINT "doctor_days_off_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "doctor_days_off" ADD CONSTRAINT "doctor_days_off_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
