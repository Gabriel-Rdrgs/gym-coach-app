// scripts/clean-orphan-data.ts
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🧹 Limpando dados órfãos...\n')

  // Deletar workouts órfãos
  const workouts = await prisma.$executeRaw`
    DELETE FROM "Workout" 
    WHERE "userId" NOT IN (SELECT id FROM "User")
  `
  console.log(`🗑️ ${workouts} treinos órfãos deletados`)

  // Deletar métricas órfãs
  const metrics = await prisma.$executeRaw`
    DELETE FROM "Metric" 
    WHERE "userId" NOT IN (SELECT id FROM "User")
  `
  console.log(`🗑️ ${metrics} métricas órfãs deletadas`)

  // Deletar recordes órfãos
  const records = await prisma.$executeRaw`
    DELETE FROM "PersonalRecord" 
    WHERE "userId" NOT IN (SELECT id FROM "User")
  `
  console.log(`🗑️ ${records} recordes órfãos deletados`)

  console.log('\n✅ Limpeza concluída!')
  console.log('⚠️ Agora rode: npx prisma db push')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
