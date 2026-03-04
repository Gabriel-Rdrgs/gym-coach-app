import { NextResponse } from "next/server";
import { getTodayWorkoutData } from "@/lib/queries/today-workout";
import { auth } from "@/lib/auth";

/**
 * GET /api/programs/today
 * Retorna o treino agendado para hoje. Usa a mesma função que a página para uma única conexão na home.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const data = await getTodayWorkoutData(userId);
  if (data.error) {
    return NextResponse.json(
      { hasWorkout: false, error: data.error },
      { status: 500 }
    );
  }
  return NextResponse.json(data);
}
