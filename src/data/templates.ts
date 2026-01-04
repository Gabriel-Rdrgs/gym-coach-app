// Estrutura hierárquica de templates
export const workoutPrograms = {
  'PPL': {
    name: 'PPL (Push/Pull/Legs)',
    description: 'Divisão clássica em 6 treinos',
    templates: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
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
} as const;

// Templates individuais (mantendo os PPL originais intactos)
export const workoutTemplates = {
  // PPL - Push A (mantido original)
    'Push A': [
      { name: 'Supino reto barra', muscleGroup: 'chest' },
      { name: 'Supino inclinado halteres', muscleGroup: 'chest' },
      { name: 'Desenvolvimento halteres sentado', muscleGroup: 'shoulders' },
      { name: 'Elevação lateral halteres', muscleGroup: 'side_delts' },
      { name: 'Tríceps testa barra EZ', muscleGroup: 'triceps' },
      { name: 'Crunch na máquina', muscleGroup: 'abs' },
    ],

  // PPL - Pull A (mantido original)
    'Pull A': [
      { name: 'Barra fixa', muscleGroup: 'back' },
      { name: 'Remada curvada barra', muscleGroup: 'back' },
      { name: 'Remada baixa máquina', muscleGroup: 'back' },
      { name: 'Face pull', muscleGroup: 'rear_delts' },
      { name: 'Rosca direta barra', muscleGroup: 'biceps' },
      { name: 'Extensão lombar banco romano', muscleGroup: 'lower_back' },
      { name: 'Prancha', muscleGroup: 'core' },
    ],

  // PPL - Legs A (mantido original)
    'Legs A': [
      { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Leg press', muscleGroup: 'quads' },
    { name: 'Cadeira extensora', muscleGroup: 'quads' },
    { name: 'Adutor máquina', muscleGroup: 'adductors' },
    { name: 'Mesa flexora', muscleGroup: 'hamstrings' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
  ],

  // PPL - Push B (mantido original)
  'Push B': [
    { name: 'Supino inclinado máquina', muscleGroup: 'chest' },
    { name: 'Supino reto halteres', muscleGroup: 'chest' },
    { name: 'Desenvolvimento máquina', muscleGroup: 'shoulders' },
    { name: 'Elevação lateral polia', muscleGroup: 'side_delts' },
    { name: 'Tríceps mergulho máquina', muscleGroup: 'triceps' },
    { name: 'Crunch polia joelhado', muscleGroup: 'abs' },
  ],

  // PPL - Pull B (mantido original)
  'Pull B': [
    { name: 'Remada cavalinho T-bar', muscleGroup: 'back' },
    { name: 'Remada unilateral halter', muscleGroup: 'back' },
    { name: 'Pulldown pull-over', muscleGroup: 'back' },
    { name: 'Reverse pec deck', muscleGroup: 'rear_delts' },
    { name: 'Rosca alternada halteres', muscleGroup: 'biceps' },
  ],

  // PPL - Legs B (mantido original)
  'Legs B': [
    { name: 'Terra tradicional', muscleGroup: 'posterior' },
    { name: 'Hip thrust barra', muscleGroup: 'glutes' },
    { name: 'Agachamento búlgaro', muscleGroup: 'glutes' },
    { name: 'Panturrilha leg press', muscleGroup: 'calves' },
    { name: 'Ab wheel', muscleGroup: 'abs' },
  ],

  // Upper/Lower - Upper A
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

  // Upper/Lower - Lower A
  'Lower A': [
    { name: 'Agachamento livre', muscleGroup: 'quads' },
    { name: 'Leg press', muscleGroup: 'quads' },
    { name: 'Cadeira extensora', muscleGroup: 'quads' },
    { name: 'Stiff', muscleGroup: 'hamstrings' },
    { name: 'Mesa flexora', muscleGroup: 'hamstrings' },
    { name: 'Panturrilha em pé', muscleGroup: 'calves' },
    { name: 'Abdominal infra', muscleGroup: 'abs' },
  ],

  // Upper/Lower - Upper B
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

  // Upper/Lower - Lower B
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

  // Full Body A
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

  // Full Body B
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

  // Full Body C
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

  // Full Body D
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
} as const;
  