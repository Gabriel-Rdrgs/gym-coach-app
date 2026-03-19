export const workoutPrograms = {
  'PPL': {
    name: 'PPL (Push/Pull/Legs)',
    description: 'Divisão clássica em 6 treinos semanais',
    templates: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
  },
  'PPL Hipertrofia': {
    name: 'PPL Hipertrofia',
    description: 'PPL com foco em volume e isolamentos para máximo crescimento muscular',
    templates: ['Push Hiper A', 'Pull Hiper A', 'Legs Hiper A', 'Push Hiper B', 'Pull Hiper B', 'Legs Hiper B'],
  },
  'PPL Força': {
    name: 'PPL Força',
    description: 'PPL com foco em cargas pesadas e movimentos compostos',
    templates: ['Push Força A', 'Pull Força A', 'Legs Força A', 'Push Força B', 'Pull Força B', 'Legs Força B'],
  },
  'Upper/Lower': {
    name: 'Upper/Lower',
    description: 'Divisão em membros superiores e inferiores',
    templates: ['Upper A', 'Lower A', 'Upper B', 'Lower B'],
  },
  'Full Body': {
    name: 'Full Body',
    description: 'Treino completo do corpo em uma sessão',
    templates: ['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D'],
  },
  'ABC': {
    name: 'ABC',
    description: 'Divisão em 3 treinos: Peito/Tríceps, Costas/Bíceps, Pernas/Ombros',
    templates: ['ABC - A (Peito/Tríceps)', 'ABC - B (Costas/Bíceps)', 'ABC - C (Pernas/Ombros)'],
  },
  'ABCD': {
    name: 'ABCD',
    description: 'Divisão em 4 treinos: Peito, Costas, Pernas, Ombros/Braços',
    templates: ['ABCD - A (Peito)', 'ABCD - B (Costas)', 'ABCD - C (Pernas)', 'ABCD - D (Ombros/Braços)'],
  },
  'Força': {
    name: 'Força (Powerlifting)',
    description: 'Foco nos três principais levantamentos: Supino, Agachamento e Terra',
    templates: ['Força - Supino', 'Força - Agachamento', 'Força - Terra', 'Força - Full'],
  },
} as const;

export const workoutTemplates = {

  // ─── PPL ────────────────────────────────────────────────────────────────────

  'Push A': [
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
    { name: 'Desenvolvimento halteres sentado', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
    { name: 'Tríceps testa barra EZ', muscleGroup: 'triceps' },
    { name: 'Crunch na máquina', muscleGroup: 'abs' },
  ],

  'Pull A': [
    { name: 'Barra fixa', muscleGroup: 'back' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Remada baixa máquina', muscleGroup: 'back' },
    { name: 'Face pull', muscleGroup: 'rear_delts' },
    { name: 'Rosca direta barra', muscleGroup: 'biceps' },
    { name: 'Extensão lombar banco romano', muscleGroup: 'lower_back' },
    { name: 'Prancha', muscleGroup: 'core' },
  ],

  'Legs A': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Leg press', muscleGroup: 'quads' },
    { name: 'Cadeira extensora', muscleGroup: 'quads' },
    { name: 'Adutor máquina', muscleGroup: 'adductors' },
    { name: 'Mesa flexora', muscleGroup: 'hamstrings' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
  ],

  'Push B': [
    { name: 'Supino inclinado máquina', muscleGroup: 'chest' },
    { name: 'Supino reto halteres', muscleGroup: 'chest' },
    { name: 'Desenvolvimento máquina', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral polia', muscleGroup: 'side_delts' },
    { name: 'Tríceps mergulho máquina', muscleGroup: 'triceps' },
    { name: 'Crunch polia joelhado', muscleGroup: 'abs' },
  ],

  'Pull B': [
    { name: 'Remada cavalinho T-bar', muscleGroup: 'back' },
    { name: 'Remada unilateral halter', muscleGroup: 'back' },
    { name: 'Pulldown pull-over', muscleGroup: 'back' },
    { name: 'Reverse pec deck', muscleGroup: 'rear_delts' },
    { name: 'Rosca alternada halteres', muscleGroup: 'biceps' },
  ],

  'Legs B': [
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Hip thrust barra', muscleGroup: 'glutes' },
    { name: 'Agachamento búlgaro', muscleGroup: 'glutes' },
    { name: 'Panturrilha leg press', muscleGroup: 'calves' },
    { name: 'Ab wheel', muscleGroup: 'abs' },
  ],

    // ─── PPL HIPERTROFIA ─────────────────────────────────────────────────────────

  'Push Hiper A': [
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
    { name: 'Peck deck', muscleGroup: 'chest' },
    { name: 'Desenvolvimento halteres sentado', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
    { name: 'Elevação lateral polia', muscleGroup: 'side_delts' },
    { name: 'Tríceps pulley', muscleGroup: 'triceps' },
    { name: 'Tríceps testa barra EZ', muscleGroup: 'triceps' },
  ],

  'Pull Hiper A': [
    { name: 'Puxada frontal pegada aberta', muscleGroup: 'back' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Remada com cabo', muscleGroup: 'back' },
    { name: 'Pulldown pull-over', muscleGroup: 'back' },
    { name: 'Reverse pec deck', muscleGroup: 'rear_delts' },
    { name: 'Face pull', muscleGroup: 'rear_delts' },
    { name: 'Rosca direta barra', muscleGroup: 'biceps' },
    { name: 'Rosca concentrada', muscleGroup: 'biceps' },
  ],

  'Legs Hiper A': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Leg press 45°', muscleGroup: 'quads' },
    { name: 'Cadeira extensora', muscleGroup: 'quads' },
    { name: 'Extensão de perna unilateral', muscleGroup: 'quads' },
    { name: 'Stiff', muscleGroup: 'hamstrings' },
    { name: 'Mesa flexora', muscleGroup: 'hamstrings' },
    { name: 'Adutor máquina', muscleGroup: 'adductors' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
    { name: 'Panturrilha sentado', muscleGroup: 'calves' },
  ],

  'Push Hiper B': [
    { name: 'Supino reto halteres', muscleGroup: 'chest' },
    { name: 'Supino declinado barra', muscleGroup: 'chest' },
    { name: 'Crucifixo halteres', muscleGroup: 'chest' },
    { name: 'Desenvolvimento máquina', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral máquina', muscleGroup: 'side_delts' },
    { name: 'Elevação lateral com cabo', muscleGroup: 'side_delts' },
    { name: 'Tríceps mergulho máquina', muscleGroup: 'triceps' },
    { name: 'Tríceps francês', muscleGroup: 'triceps' },
    { name: 'Crunch na máquina', muscleGroup: 'abs' },
  ],

  'Pull Hiper B': [
    { name: 'Barra fixa', muscleGroup: 'back' },
    { name: 'Remada cavalinho T-bar', muscleGroup: 'back' },
    { name: 'Remada unilateral halter', muscleGroup: 'back' },
    { name: 'Remada baixa máquina', muscleGroup: 'back' },
    { name: 'Reverse pec deck', muscleGroup: 'rear_delts' },
    { name: 'Rosca alternada halteres', muscleGroup: 'biceps' },
    { name: 'Rosca no banco Scott', muscleGroup: 'biceps' },
    { name: 'Rosca com cabo', muscleGroup: 'biceps' },
  ],

  'Legs Hiper B': [
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Hip thrust barra', muscleGroup: 'glutes' },
    { name: 'Agachamento búlgaro', muscleGroup: 'glutes' },
    { name: 'Abdução de perna', muscleGroup: 'glutes' },
    { name: 'Cadeira flexora', muscleGroup: 'hamstrings' },
    { name: 'Levantamento terra romeno', muscleGroup: 'hamstrings' },
    { name: 'Panturrilha leg press', muscleGroup: 'calves' },
    { name: 'Panturrilha unilateral', muscleGroup: 'calves' },
    { name: 'Ab wheel', muscleGroup: 'abs' },
  ],

  // ─── PPL FORÇA ───────────────────────────────────────────────────────────────

  'Push Força A': [
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
    { name: 'Supino com pegada fechada', muscleGroup: 'chest' },
    { name: 'Desenvolvimento com barra', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
    { name: 'Tríceps testa barra EZ', muscleGroup: 'triceps' },
  ],

  'Pull Força A': [
    { name: 'Barra fixa', muscleGroup: 'back' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Remada cavalinho T-bar', muscleGroup: 'back' },
    { name: 'Face pull', muscleGroup: 'rear_delts' },
    { name: 'Rosca direta barra', muscleGroup: 'biceps' },
    { name: 'Rosca no banco Scott', muscleGroup: 'biceps' },
    { name: 'Extensão lombar banco romano', muscleGroup: 'lower_back' },
  ],

  'Legs Força A': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Agachamento frontal', muscleGroup: 'quads' },
    { name: 'Leg press 45°', muscleGroup: 'quads' },
    { name: 'Stiff', muscleGroup: 'hamstrings' },
    { name: 'Hip thrust barra', muscleGroup: 'glutes' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
  ],

  'Push Força B': [
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Supino declinado barra', muscleGroup: 'chest' },
    { name: 'Desenvolvimento Arnold', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral máquina', muscleGroup: 'side_delts' },
    { name: 'Paralelas', muscleGroup: 'triceps' },
    { name: 'Tríceps francês', muscleGroup: 'triceps' },
  ],

  'Pull Força B': [
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Puxada frontal pegada fechada', muscleGroup: 'back' },
    { name: 'Reverse pec deck', muscleGroup: 'rear_delts' },
    { name: 'Rosca martelo', muscleGroup: 'biceps' },
    { name: 'Rosca alternada halteres', muscleGroup: 'biceps' },
  ],

  'Legs Força B': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Hack squat', muscleGroup: 'quads' },
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Levantamento terra romeno', muscleGroup: 'hamstrings' },
    { name: 'Cadeira flexora', muscleGroup: 'hamstrings' },
    { name: 'Panturrilha sentado', muscleGroup: 'calves' },
    { name: 'Prancha', muscleGroup: 'core' },
  ],


  // ─── UPPER/LOWER ────────────────────────────────────────────────────────────

  'Upper A': [
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
    { name: 'Puxada frontal pegada aberta', muscleGroup: 'back' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Desenvolvimento com barra', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
    { name: 'Rosca direta barra', muscleGroup: 'biceps' },
    { name: 'Tríceps pulley', muscleGroup: 'triceps' },
  ],

  'Lower A': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Leg press', muscleGroup: 'quads' },
    { name: 'Cadeira extensora', muscleGroup: 'quads' },
    { name: 'Stiff', muscleGroup: 'hamstrings' },
    { name: 'Mesa flexora', muscleGroup: 'hamstrings' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
    { name: 'Abdominal infra', muscleGroup: 'abs' },
  ],

  'Upper B': [
    { name: 'Supino declinado barra', muscleGroup: 'chest' },
    { name: 'Crucifixo halteres', muscleGroup: 'chest' },
    { name: 'Puxada frontal pegada fechada', muscleGroup: 'back' },
    { name: 'Remada com cabo', muscleGroup: 'back' },
    { name: 'Desenvolvimento Arnold', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral máquina', muscleGroup: 'side_delts' },
    { name: 'Rosca martelo', muscleGroup: 'biceps' },
    { name: 'Tríceps francês', muscleGroup: 'triceps' },
  ],

  'Lower B': [
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Agachamento frontal', muscleGroup: 'quads' },
    { name: 'Hack squat', muscleGroup: 'quads' },
    { name: 'Levantamento terra romeno', muscleGroup: 'hamstrings' },
    { name: 'Cadeira flexora', muscleGroup: 'hamstrings' },
    { name: 'Hip thrust barra', muscleGroup: 'glutes' },
    { name: 'Panturrilha sentado', muscleGroup: 'calves' },
    { name: 'Leg raise', muscleGroup: 'abs' },
  ],

  // ─── FULL BODY ───────────────────────────────────────────────────────────────

  'Full Body A': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Desenvolvimento halteres sentado', muscleGroup: 'shoulders' },
    { name: 'Rosca direta barra', muscleGroup: 'biceps' },
    { name: 'Tríceps testa barra EZ', muscleGroup: 'triceps' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
    { name: 'Prancha', muscleGroup: 'core' },
  ],

  'Full Body B': [
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
    { name: 'Remada baixa máquina', muscleGroup: 'back' },
    { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
    { name: 'Rosca alternada halteres', muscleGroup: 'biceps' },
    { name: 'Tríceps mergulho máquina', muscleGroup: 'triceps' },
    { name: 'Panturrilha leg press', muscleGroup: 'calves' },
    { name: 'Ab wheel', muscleGroup: 'abs' },
  ],

  'Full Body C': [
    { name: 'Agachamento frontal', muscleGroup: 'quads' },
    { name: 'Supino declinado barra', muscleGroup: 'chest' },
    { name: 'Puxada frontal pegada aberta', muscleGroup: 'back' },
    { name: 'Desenvolvimento com barra', muscleGroup: 'shoulders' },
    { name: 'Rosca martelo', muscleGroup: 'biceps' },
    { name: 'Tríceps pulley', muscleGroup: 'triceps' },
    { name: 'Panturrilha sentado', muscleGroup: 'calves' },
    { name: 'Russian twist', muscleGroup: 'abs' },
  ],

  'Full Body D': [
    { name: 'Hack squat', muscleGroup: 'quads' },
    { name: 'Crucifixo halteres', muscleGroup: 'chest' },
    { name: 'Remada com cabo', muscleGroup: 'back' },
    { name: 'Desenvolvimento Arnold', muscleGroup: 'shoulders' },
    { name: 'Rosca concentrada', muscleGroup: 'biceps' },
    { name: 'Tríceps francês', muscleGroup: 'triceps' },
    { name: 'Panturrilha unilateral', muscleGroup: 'calves' },
    { name: 'Mountain climber', muscleGroup: 'abs' },
  ],

  // ─── ABC ────────────────────────────────────────────────────────────────────

  'ABC - A (Peito/Tríceps)': [
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
    { name: 'Supino declinado barra', muscleGroup: 'chest' },
    { name: 'Peck deck', muscleGroup: 'chest' },
    { name: 'Tríceps pulley', muscleGroup: 'triceps' },
    { name: 'Tríceps testa barra EZ', muscleGroup: 'triceps' },
    { name: 'Paralelas', muscleGroup: 'triceps' },
  ],

  'ABC - B (Costas/Bíceps)': [
    { name: 'Barra fixa', muscleGroup: 'back' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Puxada frontal pegada aberta', muscleGroup: 'back' },
    { name: 'Remada unilateral halter', muscleGroup: 'back' },
    { name: 'Face pull', muscleGroup: 'rear_delts' },
    { name: 'Rosca direta barra', muscleGroup: 'biceps' },
    { name: 'Rosca martelo', muscleGroup: 'biceps' },
    { name: 'Rosca no banco Scott', muscleGroup: 'biceps' },
  ],

  'ABC - C (Pernas/Ombros)': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Leg press', muscleGroup: 'quads' },
    { name: 'Cadeira extensora', muscleGroup: 'quads' },
    { name: 'Stiff', muscleGroup: 'hamstrings' },
    { name: 'Hip thrust barra', muscleGroup: 'glutes' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
    { name: 'Desenvolvimento com barra', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
  ],

  // ─── ABCD ───────────────────────────────────────────────────────────────────

  'ABCD - A (Peito)': [
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
    { name: 'Supino declinado barra', muscleGroup: 'chest' },
    { name: 'Crucifixo halteres', muscleGroup: 'chest' },
    { name: 'Peck deck', muscleGroup: 'chest' },
    { name: 'Flexão de braço', muscleGroup: 'chest' },
  ],

  'ABCD - B (Costas)': [
    { name: 'Barra fixa', muscleGroup: 'back' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Puxada frontal pegada aberta', muscleGroup: 'back' },
    { name: 'Remada cavalinho T-bar', muscleGroup: 'back' },
    { name: 'Remada unilateral halter', muscleGroup: 'back' },
    { name: 'Reverse pec deck', muscleGroup: 'rear_delts' },
    { name: 'Extensão lombar banco romano', muscleGroup: 'lower_back' },
  ],

  'ABCD - C (Pernas)': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Leg press 45°', muscleGroup: 'quads' },
    { name: 'Cadeira extensora', muscleGroup: 'quads' },
    { name: 'Stiff', muscleGroup: 'hamstrings' },
    { name: 'Cadeira flexora', muscleGroup: 'hamstrings' },
    { name: 'Hip thrust barra', muscleGroup: 'glutes' },
    { name: 'Adutor máquina', muscleGroup: 'adductors' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
  ],

  'ABCD - D (Ombros/Braços)': [
    { name: 'Desenvolvimento com barra', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
    { name: 'Elevação lateral máquina', muscleGroup: 'side_delts' },
    { name: 'Face pull', muscleGroup: 'rear_delts' },
    { name: 'Rosca direta barra', muscleGroup: 'biceps' },
    { name: 'Rosca martelo', muscleGroup: 'biceps' },
    { name: 'Tríceps pulley', muscleGroup: 'triceps' },
    { name: 'Tríceps testa barra EZ', muscleGroup: 'triceps' },
  ],

  // ─── FORÇA (POWERLIFTING) ────────────────────────────────────────────────────

  'Força - Supino': [
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Supino com pegada fechada', muscleGroup: 'chest' },
    { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
    { name: 'Tríceps testa barra EZ', muscleGroup: 'triceps' },
    { name: 'Tríceps francês', muscleGroup: 'triceps' },
    { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
  ],

  'Força - Agachamento': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Agachamento frontal', muscleGroup: 'quads' },
    { name: 'Leg press 45°', muscleGroup: 'quads' },
    { name: 'Cadeira extensora', muscleGroup: 'quads' },
    { name: 'Stiff', muscleGroup: 'hamstrings' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
  ],

  'Força - Terra': [
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Levantamento terra romeno', muscleGroup: 'hamstrings' },
    { name: 'Stiff', muscleGroup: 'hamstrings' },
    { name: 'Hip thrust barra', muscleGroup: 'glutes' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Extensão lombar banco romano', muscleGroup: 'lower_back' },
  ],

  'Força - Full': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Supino reto barra', muscleGroup: 'chest' },
    { name: 'Desenvolvimento com barra', muscleGroup: 'shoulders' },
    { name: 'Remada curvada barra', muscleGroup: 'back' },
    { name: 'Rosca direta barra', muscleGroup: 'biceps' },
    { name: 'Tríceps pulley', muscleGroup: 'triceps' },
  ],

} as const;