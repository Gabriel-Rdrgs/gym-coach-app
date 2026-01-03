import { prisma } from "../src/lib/prisma";

const exercises = [
  // Push A (Peito/Tríceps)
  { name: "Supino reto barra", muscleGroup: "chest", type: "compound" },
  { name: "Supino inclinado halteres", muscleGroup: "chest", type: "compound" },
  { name: "Desenvolvimento halteres sentado", muscleGroup: "shoulders", type: "compound" },
  { name: "Elevação lateral halteres", muscleGroup: "side_delts", type: "isolation" },
  { name: "Tríceps testa barra EZ", muscleGroup: "triceps", type: "isolation" },
  { name: "Crunch na máquina", muscleGroup: "abs", type: "isolation" },

  // Pull A (Costas/Bíceps)
  { name: "Barra fixa", muscleGroup: "back", type: "compound" },
  { name: "Remada curvada barra", muscleGroup: "back", type: "compound" },
  { name: "Remada baixa máquina", muscleGroup: "back", type: "compound" },
  { name: "Face pull", muscleGroup: "rear_delts", type: "isolation" },
  { name: "Rosca direta barra", muscleGroup: "biceps", type: "isolation" },
  { name: "Extensão lombar banco romano", muscleGroup: "lower_back", type: "isolation" },
  { name: "Prancha", muscleGroup: "core", type: "isolation" },

  // Legs A (Quads/Adutores)
  { name: "Agachamento livre", muscleGroup: "quads", type: "compound" },
  { name: "Leg press", muscleGroup: "quads", type: "compound" },
  { name: "Cadeira extensora", muscleGroup: "quads", type: "isolation" },
  { name: "Adutor máquina", muscleGroup: "adductors", type: "isolation" },
  { name: "Mesa flexora", muscleGroup: "hamstrings", type: "isolation" },
  { name: "Panturrilha em pé", muscleGroup: "calves", type: "isolation" },

  // Push B (Ombros)
  { name: "Supino inclinado máquina", muscleGroup: "chest", type: "compound" },
  { name: "Supino reto halteres", muscleGroup: "chest", type: "compound" },
  { name: "Desenvolvimento máquina", muscleGroup: "shoulders", type: "compound" },
  { name: "Elevação lateral polia", muscleGroup: "side_delts", type: "isolation" },
  { name: "Tríceps mergulho máquina", muscleGroup: "triceps", type: "isolation" },
  { name: "Crunch polia joelhado", muscleGroup: "abs", type: "isolation" },

  // Pull B (Posterior de ombro)
  { name: "Remada cavalinho T-bar", muscleGroup: "back", type: "compound" },
  { name: "Remada unilateral halter", muscleGroup: "back", type: "compound" },
  { name: "Pulldown pull-over", muscleGroup: "back", type: "compound" },
  { name: "Reverse pec deck", muscleGroup: "rear_delts", type: "isolation" },
  { name: "Rosca alternada halteres", muscleGroup: "biceps", type: "isolation" },

  // Legs B (Posterior/Glúteo)
  { name: "Terra tradicional", muscleGroup: "posterior", type: "compound" },
  { name: "Hip thrust barra", muscleGroup: "glutes", type: "compound" },
  { name: "Agachamento búlgaro", muscleGroup: "glutes", type: "compound" },
  { name: "Panturrilha leg press", muscleGroup: "calves", type: "isolation" },
  { name: "Ab wheel", muscleGroup: "abs", type: "isolation" },

  // Exercícios adicionais para Upper/Lower e Full Body
  // Peito
  { name: "Supino declinado barra", muscleGroup: "chest", type: "compound" },
  { name: "Supino declinado halteres", muscleGroup: "chest", type: "compound" },
  { name: "Crucifixo halteres", muscleGroup: "chest", type: "isolation" },
  { name: "Peck deck", muscleGroup: "chest", type: "isolation" },
  { name: "Flexão de braço", muscleGroup: "chest", type: "compound" },
  { name: "Supino com pegada fechada", muscleGroup: "chest", type: "compound" },

  // Costas
  { name: "Puxada frontal pegada aberta", muscleGroup: "back", type: "compound" },
  { name: "Puxada frontal pegada fechada", muscleGroup: "back", type: "compound" },
  { name: "Remada alta", muscleGroup: "back", type: "compound" },
  { name: "Remada com cabo", muscleGroup: "back", type: "compound" },
  { name: "Puxada no pulley", muscleGroup: "back", type: "compound" },
  { name: "Encolhimento de ombros", muscleGroup: "back", type: "isolation" },

  // Ombros
  { name: "Desenvolvimento com barra", muscleGroup: "shoulders", type: "compound" },
  { name: "Elevação frontal halteres", muscleGroup: "shoulders", type: "isolation" },
  { name: "Elevação lateral máquina", muscleGroup: "side_delts", type: "isolation" },
  { name: "Desenvolvimento Arnold", muscleGroup: "shoulders", type: "compound" },
  { name: "Elevação lateral com cabo", muscleGroup: "side_delts", type: "isolation" },

  // Tríceps
  { name: "Tríceps pulley", muscleGroup: "triceps", type: "isolation" },
  { name: "Tríceps francês", muscleGroup: "triceps", type: "isolation" },
  { name: "Tríceps coice", muscleGroup: "triceps", type: "isolation" },
  { name: "Paralelas", muscleGroup: "triceps", type: "compound" },

  // Bíceps
  { name: "Rosca martelo", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca concentrada", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca no banco Scott", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca com cabo", muscleGroup: "biceps", type: "isolation" },

  // Pernas - Quadríceps
  { name: "Agachamento frontal", muscleGroup: "quads", type: "compound" },
  { name: "Hack squat", muscleGroup: "quads", type: "compound" },
  { name: "Afundo", muscleGroup: "quads", type: "compound" },
  { name: "Leg press 45°", muscleGroup: "quads", type: "compound" },
  { name: "Extensão de perna unilateral", muscleGroup: "quads", type: "isolation" },

  // Pernas - Posterior
  { name: "Stiff", muscleGroup: "hamstrings", type: "compound" },
  { name: "Levantamento terra romeno", muscleGroup: "hamstrings", type: "compound" },
  { name: "Cadeira flexora", muscleGroup: "hamstrings", type: "isolation" },
  { name: "Flexão de perna deitado", muscleGroup: "hamstrings", type: "isolation" },

  // Glúteos
  { name: "Agachamento sumô", muscleGroup: "glutes", type: "compound" },
  { name: "Elevação pélvica", muscleGroup: "glutes", type: "compound" },
  { name: "Abdução de perna", muscleGroup: "glutes", type: "isolation" },

  // Panturrilhas
  { name: "Panturrilha sentado", muscleGroup: "calves", type: "isolation" },
  { name: "Panturrilha no leg press", muscleGroup: "calves", type: "isolation" },
  { name: "Panturrilha unilateral", muscleGroup: "calves", type: "isolation" },

  // Core/Abdômen
  { name: "Abdominal infra", muscleGroup: "abs", type: "isolation" },
  { name: "Abdominal supra", muscleGroup: "abs", type: "isolation" },
  { name: "Russian twist", muscleGroup: "abs", type: "isolation" },
  { name: "Mountain climber", muscleGroup: "abs", type: "isolation" },
  { name: "Leg raise", muscleGroup: "abs", type: "isolation" },
];

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Usar Promise.all para executar upserts em paralelo (mais eficiente)
    await Promise.all(
      exercises.map(async (ex) => {
        await prisma.exercise.upsert({
          where: { name: ex.name } as any,
          update: ex,
          create: ex,
        });
      })
    );

    console.log(`✅ ${exercises.length} exercícios processados (criados ou atualizados).`);
    console.log(`🎉 Seed concluído com sucesso! Total: ${exercises.length} exercícios.`);
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro fatal:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
