import "dotenv/config"
import { prisma } from "../src/lib/prisma"
import bcrypt from 'bcryptjs'

const exercises = [

  // ─── PEITO ───────────────────────────────────────────────────────────────────
  { name: "Supino reto barra", muscleGroup: "chest", type: "compound" },
  { name: "Supino reto halteres", muscleGroup: "chest", type: "compound" },
  { name: "Supino inclinado barra", muscleGroup: "chest", type: "compound" },
  { name: "Supino inclinado halteres", muscleGroup: "chest", type: "compound" },
  { name: "Supino inclinado máquina", muscleGroup: "chest", type: "compound" },
  { name: "Supino declinado barra", muscleGroup: "chest", type: "compound" },
  { name: "Supino declinado halteres", muscleGroup: "chest", type: "compound" },
  { name: "Supino com pegada fechada", muscleGroup: "chest", type: "compound" },
  { name: "Crucifixo halteres", muscleGroup: "chest", type: "isolation" },
  { name: "Crucifixo inclinado halteres", muscleGroup: "chest", type: "isolation" },
  { name: "Peck deck", muscleGroup: "chest", type: "isolation" },
  { name: "Crossover polia", muscleGroup: "chest", type: "isolation" },
  { name: "Flexão de braço", muscleGroup: "chest", type: "compound" },
  { name: "Flexão de braço inclinada", muscleGroup: "chest", type: "compound" },
  { name: "Pullover halteres", muscleGroup: "chest", type: "isolation" },

  // ─── COSTAS ──────────────────────────────────────────────────────────────────
  { name: "Barra fixa", muscleGroup: "back", type: "compound" },
  { name: "Barra fixa pegada supinada", muscleGroup: "back", type: "compound" },
  { name: "Remada curvada barra", muscleGroup: "back", type: "compound" },
  { name: "Remada curvada halteres", muscleGroup: "back", type: "compound" },
  { name: "Remada unilateral halter", muscleGroup: "back", type: "compound" },
  { name: "Remada baixa máquina", muscleGroup: "back", type: "compound" },
  { name: "Remada cavalinho T-bar", muscleGroup: "back", type: "compound" },
  { name: "Remada com cabo", muscleGroup: "back", type: "compound" },
  { name: "Remada alta", muscleGroup: "back", type: "compound" },
  { name: "Puxada frontal pegada aberta", muscleGroup: "back", type: "compound" },
  { name: "Puxada frontal pegada fechada", muscleGroup: "back", type: "compound" },
  { name: "Puxada no pulley", muscleGroup: "back", type: "compound" },
  { name: "Pulldown pull-over", muscleGroup: "back", type: "compound" },
  { name: "Encolhimento de ombros", muscleGroup: "back", type: "isolation" },
  { name: "Serrote com halter", muscleGroup: "back", type: "compound" },

  // ─── OMBROS ──────────────────────────────────────────────────────────────────
  { name: "Desenvolvimento com barra", muscleGroup: "shoulders", type: "compound" },
  { name: "Desenvolvimento halteres sentado", muscleGroup: "shoulders", type: "compound" },
  { name: "Desenvolvimento máquina", muscleGroup: "shoulders", type: "compound" },
  { name: "Desenvolvimento Arnold", muscleGroup: "shoulders", type: "compound" },
  { name: "Elevação frontal halteres", muscleGroup: "shoulders", type: "isolation" },
  { name: "Elevação frontal barra", muscleGroup: "shoulders", type: "isolation" },

  // ─── DELTÓIDE LATERAL ────────────────────────────────────────────────────────
  { name: "Elevação lateral halteres", muscleGroup: "side_delts", type: "isolation" },
  { name: "Elevação lateral máquina", muscleGroup: "side_delts", type: "isolation" },
  { name: "Elevação lateral polia", muscleGroup: "side_delts", type: "isolation" },
  { name: "Elevação lateral com cabo", muscleGroup: "side_delts", type: "isolation" },

  // ─── DELTÓIDE POSTERIOR ──────────────────────────────────────────────────────
  { name: "Face pull", muscleGroup: "rear_delts", type: "isolation" },
  { name: "Reverse pec deck", muscleGroup: "rear_delts", type: "isolation" },
  { name: "Elevação posterior halteres", muscleGroup: "rear_delts", type: "isolation" },
  { name: "Crucifixo invertido", muscleGroup: "rear_delts", type: "isolation" },

  // ─── TRÍCEPS ─────────────────────────────────────────────────────────────────
  { name: "Tríceps pulley", muscleGroup: "triceps", type: "isolation" },
  { name: "Tríceps pulley corda", muscleGroup: "triceps", type: "isolation" },
  { name: "Tríceps testa barra EZ", muscleGroup: "triceps", type: "isolation" },
  { name: "Tríceps francês", muscleGroup: "triceps", type: "isolation" },
  { name: "Tríceps mergulho máquina", muscleGroup: "triceps", type: "isolation" },
  { name: "Tríceps coice", muscleGroup: "triceps", type: "isolation" },
  { name: "Paralelas", muscleGroup: "triceps", type: "compound" },
  { name: "Tríceps testa halteres", muscleGroup: "triceps", type: "isolation" },

  // ─── BÍCEPS ──────────────────────────────────────────────────────────────────
  { name: "Rosca direta barra", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca direta halteres", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca alternada halteres", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca martelo", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca concentrada", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca no banco Scott", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca com cabo", muscleGroup: "biceps", type: "isolation" },
  { name: "Rosca 21", muscleGroup: "biceps", type: "isolation" },

  // ─── QUADRÍCEPS ──────────────────────────────────────────────────────────────
  { name: "Agachamento livre", muscleGroup: "quads", type: "compound" },
  { name: "Agachamento frontal", muscleGroup: "quads", type: "compound" },
  { name: "Agachamento sumô", muscleGroup: "glutes", type: "compound" },
  { name: "Agachamento búlgaro", muscleGroup: "glutes", type: "compound" },
  { name: "Hack squat", muscleGroup: "quads", type: "compound" },
  { name: "Leg press", muscleGroup: "quads", type: "compound" },
  { name: "Leg press 45°", muscleGroup: "quads", type: "compound" },
  { name: "Cadeira extensora", muscleGroup: "quads", type: "isolation" },
  { name: "Extensão de perna unilateral", muscleGroup: "quads", type: "isolation" },
  { name: "Afundo", muscleGroup: "quads", type: "compound" },
  { name: "Afundo com halteres", muscleGroup: "quads", type: "compound" },

  // ─── POSTERIOR DE COXA ───────────────────────────────────────────────────────
  { name: "Stiff", muscleGroup: "hamstrings", type: "compound" },
  { name: "Levantamento terra romeno", muscleGroup: "hamstrings", type: "compound" },
  { name: "Mesa flexora", muscleGroup: "hamstrings", type: "isolation" },
  { name: "Cadeira flexora", muscleGroup: "hamstrings", type: "isolation" },
  { name: "Flexão de perna deitado", muscleGroup: "hamstrings", type: "isolation" },
  { name: "Flexão de perna em pé", muscleGroup: "hamstrings", type: "isolation" },

  // ─── GLÚTEOS ─────────────────────────────────────────────────────────────────
  { name: "Hip thrust barra", muscleGroup: "glutes", type: "compound" },
  { name: "Hip thrust máquina", muscleGroup: "glutes", type: "compound" },
  { name: "Elevação pélvica", muscleGroup: "glutes", type: "compound" },
  { name: "Abdução de perna", muscleGroup: "glutes", type: "isolation" },
  { name: "Coice no cabo", muscleGroup: "glutes", type: "isolation" },

  // ─── POSTERIOR (TERRA) ───────────────────────────────────────────────────────
  { name: "Terra tradicional", muscleGroup: "posterior", type: "compound" },
  { name: "Terra sumô", muscleGroup: "posterior", type: "compound" },
  { name: "Terra com pegada mista", muscleGroup: "posterior", type: "compound" },

  // ─── ADUTORES ────────────────────────────────────────────────────────────────
  { name: "Adutor máquina", muscleGroup: "adductors", type: "isolation" },
  { name: "Agachamento sumô haltere", muscleGroup: "adductors", type: "compound" },

  // ─── PANTURRILHAS ────────────────────────────────────────────────────────────
  { name: "Panturrilha em pé", muscleGroup: "calves", type: "isolation" },
  { name: "Panturrilha sentado", muscleGroup: "calves", type: "isolation" },
  { name: "Panturrilha leg press", muscleGroup: "calves", type: "isolation" },
  { name: "Panturrilha unilateral", muscleGroup: "calves", type: "isolation" },
  { name: "Panturrilha no leg press", muscleGroup: "calves", type: "isolation" },

  // ─── LOMBAR ──────────────────────────────────────────────────────────────────
  { name: "Extensão lombar banco romano", muscleGroup: "lower_back", type: "isolation" },
  { name: "Extensão lombar máquina", muscleGroup: "lower_back", type: "isolation" },
  { name: "Good morning", muscleGroup: "lower_back", type: "compound" },

  // ─── ABDÔMEN / CORE ──────────────────────────────────────────────────────────
  { name: "Prancha", muscleGroup: "core", type: "isolation" },
  { name: "Prancha lateral", muscleGroup: "core", type: "isolation" },
  { name: "Ab wheel", muscleGroup: "abs", type: "isolation" },
  { name: "Crunch na máquina", muscleGroup: "abs", type: "isolation" },
  { name: "Crunch polia joelhado", muscleGroup: "abs", type: "isolation" },
  { name: "Abdominal infra", muscleGroup: "abs", type: "isolation" },
  { name: "Abdominal supra", muscleGroup: "abs", type: "isolation" },
  { name: "Russian twist", muscleGroup: "abs", type: "isolation" },
  { name: "Mountain climber", muscleGroup: "abs", type: "isolation" },
  { name: "Leg raise", muscleGroup: "abs", type: "isolation" },
  { name: "Elevação de pernas suspenso", muscleGroup: "abs", type: "isolation" },
  { name: "Bicicleta abdominal", muscleGroup: "abs", type: "isolation" },
];

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    await Promise.all(
      exercises.map(async (ex) => {
        await prisma.exercise.upsert({
          where: { name: ex.name } as any,
          update: ex,
          create: ex,
        });
      })
    );

    console.log(`✅ ${exercises.length} exercícios processados.`);
    console.log(`🎉 Seed concluído com sucesso!`);
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
