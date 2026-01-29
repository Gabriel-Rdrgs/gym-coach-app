// scripts/fix-foreign-keys.ts
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🔄 Corrigindo foreign keys...\n')

  // 1. Buscar ID do usuário na tabela antiga
  const oldUsers = await prisma.$queryRaw<any[]>`
    SELECT id, email FROM users
  `
  
  const oldUserId = oldUsers[0].id
  console.log('🔑 ID antigo:', oldUserId)

  // 2. Buscar ID do usuário na tabela nova
  const newUser = await prisma.user.findUnique({
    where: { email: 'gabriel@gymcoach.com' }
  })
  
  if (!newUser) {
    throw new Error('❌ Usuário não encontrado na tabela User')
  }
  
  console.log('🔑 ID novo:', newUser.id)

  // 3. Temporariamente desabilitar foreign keys
  await prisma.$executeRaw`SET session_replication_role = replica;`

  // 4. Atualizar todos os registros
  const workouts = await prisma.$executeRaw`
    UPDATE "Workout" SET "userId" = ${newUser.id} WHERE "userId" = ${oldUserId}
  `
  console.log(`✅ ${workouts} treinos atualizados`)

  const metrics = await prisma.$executeRaw`
    UPDATE "Metric" SET "userId" = ${newUser.id} WHERE "userId" = ${oldUserId}
  `
  console.log(`✅ ${metrics} métricas atualizadas`)

  const records = await prisma.$executeRaw`
    UPDATE "PersonalRecord" SET "userId" = ${newUser.id} WHERE "userId" = ${oldUserId}
  `
  console.log(`✅ ${records} recordes atualizados`)

  // 5. Reabilitar foreign keys
  await prisma.$executeRaw`SET session_replication_role = DEFAULT;`

  console.log('\n🎉 Foreign keys corrigidas!')
  console.log('⚠️ Agora rode: npx prisma db push e confirme com Y')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
