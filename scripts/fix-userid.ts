// scripts/fix-userid.ts
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🔄 Iniciando migração de dados...\n')

  // 1. Criar ou buscar usuário demo
  let demoUser = await prisma.user.findUnique({
    where: { email: 'gabriel@gymcoach.com' }
  })

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: 'gabriel@gymcoach.com',
        name: 'Gabriel (Demo)',
      }
    })
    console.log('✅ Usuário demo criado:', demoUser.id)
  } else {
    console.log('✅ Usuário demo encontrado:', demoUser.id)
  }

  // 2. Atualizar usando SQL Raw (contorna validação do Prisma)
  console.log('\n📝 Atualizando registros com SQL...\n')

  const metricsResult = await prisma.$executeRaw`
    UPDATE "Metric" 
    SET "userId" = ${demoUser.id}::text 
    WHERE "userId" IS NULL
  `
  console.log(`✅ ${metricsResult} métricas atualizadas`)

  const recordsResult = await prisma.$executeRaw`
    UPDATE "PersonalRecord" 
    SET "userId" = ${demoUser.id}::text 
    WHERE "userId" IS NULL
  `
  console.log(`✅ ${recordsResult} recordes atualizados`)

  const workoutsResult = await prisma.$executeRaw`
    UPDATE "Workout" 
    SET "userId" = ${demoUser.id}::text 
    WHERE "userId" IS NULL
  `
  console.log(`✅ ${workoutsResult} treinos atualizados`)

  console.log('\n🎉 Migração concluída! Agora rode: npx prisma db push')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
