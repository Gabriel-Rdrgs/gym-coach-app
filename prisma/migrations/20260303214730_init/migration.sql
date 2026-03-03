/*
  Warnings:

  - Made the column `userId` on table `Metric` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `PersonalRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Workout` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Metric" DROP CONSTRAINT "Metric_userId_fkey";

-- DropForeignKey
ALTER TABLE "PersonalRecord" DROP CONSTRAINT "PersonalRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "Workout" DROP CONSTRAINT "Workout_userId_fkey";

-- AlterTable
ALTER TABLE "Metric" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PersonalRecord" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Workout" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Metric_userId_idx" ON "Metric"("userId");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_idx" ON "PersonalRecord"("userId");

-- CreateIndex
CREATE INDEX "Workout_userId_idx" ON "Workout"("userId");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
