import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ExerciseEvolutionClient from './ExerciseEvolutionClient';

export default async function ExerciseEvolutionPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect('/login');
  }

  return <ExerciseEvolutionClient />;
}
