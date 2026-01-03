-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "equipment" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "ExerciseAlternative" (
    "id" SERIAL NOT NULL,
    "mainExerciseId" INTEGER NOT NULL,
    "alternativeId" INTEGER NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "ExerciseAlternative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" SERIAL NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workoutId" INTEGER,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseAlternative_mainExerciseId_idx" ON "ExerciseAlternative"("mainExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseAlternative_mainExerciseId_alternativeId_key" ON "ExerciseAlternative"("mainExerciseId", "alternativeId");

-- CreateIndex
CREATE INDEX "PersonalRecord_exerciseId_idx" ON "PersonalRecord"("exerciseId");

-- CreateIndex
CREATE INDEX "PersonalRecord_date_idx" ON "PersonalRecord"("date");

-- AddForeignKey
ALTER TABLE "ExerciseAlternative" ADD CONSTRAINT "ExerciseAlternative_mainExerciseId_fkey" FOREIGN KEY ("mainExerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAlternative" ADD CONSTRAINT "ExerciseAlternative_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
