// scripts/migrate-users-table.ts
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🔄 Migrando dados da tabela users para User...\n')

  // 1. Buscar todos os dados da tabela antiga
  const oldUsers = await prisma.$queryRaw<any[]>`
    SELECT * FROM users
  `
  
  console.log(`📊 Encontrados ${oldUsers.length} usuários na tabela antiga`)

  // 2. Inserir na tabela nova (User)
  for (const oldUser of oldUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: oldUser.email }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: oldUser.id,
          email: oldUser.email,
          name: oldUser.name,
          emailVerified: oldUser.emailVerified,
          image: oldUser.image,
        }
      })
      console.log(`✅ Usuário migrado: ${oldUser.email}`)
    } else {
      console.log(`⏭️ Usuário já existe: ${oldUser.email}`)
    }
  }

  console.log('\n🎉 Migração concluída!')
  console.log('\n⚠️ IMPORTANTE: Agora rode `npx prisma db push` e confirme com Y')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
