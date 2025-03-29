-- DropForeignKey
ALTER TABLE "doctor_branches" DROP CONSTRAINT "doctor_branches_branchId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_branches" DROP CONSTRAINT "doctor_branches_doctorId_fkey";

-- AddForeignKey
ALTER TABLE "doctor_branches" ADD CONSTRAINT "doctor_branches_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_branches" ADD CONSTRAINT "doctor_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
