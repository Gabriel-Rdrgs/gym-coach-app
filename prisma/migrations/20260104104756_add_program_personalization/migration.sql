-- AlterTable
ALTER TABLE "WorkoutProgram" ADD COLUMN     "equipmentAvailable" JSONB,
ADD COLUMN     "focusMuscleGroups" JSONB,
ADD COLUMN     "objectives" JSONB,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "trainingDaysPerWeek" INTEGER;

-- CreateTable
CREATE TABLE "ExercisePreference" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "preference" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExercisePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSubstitution" (
    "id" SERIAL NOT NULL,
    "scheduledWorkoutId" INTEGER NOT NULL,
    "originalExerciseId" INTEGER NOT NULL,
    "substitutedExerciseId" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExercisePreference_programId_idx" ON "ExercisePreference"("programId");

-- CreateIndex
CREATE INDEX "ExercisePreference_exerciseId_idx" ON "ExercisePreference"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExercisePreference_programId_exerciseId_key" ON "ExercisePreference"("programId", "exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseSubstitution_scheduledWorkoutId_idx" ON "ExerciseSubstitution"("scheduledWorkoutId");

-- CreateIndex
CREATE INDEX "ExerciseSubstitution_originalExerciseId_idx" ON "ExerciseSubstitution"("originalExerciseId");

-- CreateIndex
CREATE INDEX "ExerciseSubstitution_substitutedExerciseId_idx" ON "ExerciseSubstitution"("substitutedExerciseId");

-- AddForeignKey
ALTER TABLE "ExercisePreference" ADD CONSTRAINT "ExercisePreference_programId_fkey" FOREIGN KEY ("programId") REFERENCES "WorkoutProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExercisePreference" ADD CONSTRAINT "ExercisePreference_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSubstitution" ADD CONSTRAINT "ExerciseSubstitution_scheduledWorkoutId_fkey" FOREIGN KEY ("scheduledWorkoutId") REFERENCES "ScheduledWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSubstitution" ADD CONSTRAINT "ExerciseSubstitution_originalExerciseId_fkey" FOREIGN KEY ("originalExerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSubstitution" ADD CONSTRAINT "ExerciseSubstitution_substitutedExerciseId_fkey" FOREIGN KEY ("substitutedExerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
