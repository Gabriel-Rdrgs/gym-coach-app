import { prisma } from '@/lib/prisma';

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { muscleGroup: 'asc' },
  });

  return (
    <div className="flex justify-center min-h-screen py-12 px-8">
      <div className="w-full max-w-4xl">
        <div className="mb-16 text-center">
          <h1 
            className="text-5xl font-bold mb-6 text-glow"
            style={{ 
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-orbitron), sans-serif',
              letterSpacing: '2px',
            }}
          >
            Exercícios
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            {exercises.length} exercícios disponíveis
          </p>
        </div>
        
        {/* Espaçamento vertical */}
        <div style={{ height: '32px' }}></div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="card-neon" style={{ padding: '24px' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent-primary)' }}>
              {exercise.name}
            </h2>
            <div className="space-y-2 text-sm">
              <p style={{ color: 'var(--text-primary)' }}>
                <span className="font-medium" style={{ color: 'var(--accent-secondary)' }}>Grupo:</span>{' '}
                <span className="capitalize">{exercise.muscleGroup.replace('_', ' ')}</span>
              </p>
              <p style={{ color: 'var(--text-primary)' }}>
                <span className="font-medium" style={{ color: 'var(--accent-secondary)' }}>Tipo:</span>{' '}
                {exercise.type}
              </p>
              {exercise.notes && (
                <p style={{ color: 'var(--text-muted)' }}>
                  <span className="font-medium">Notas:</span> {exercise.notes}
                </p>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
