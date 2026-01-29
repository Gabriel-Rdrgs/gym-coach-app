// scripts/create-demo-user.ts
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🔄 Criando usuário demo...\n')

  // Verificar se já existe
  const existing = await prisma.user.findUnique({
    where: { email: 'gabriel@gymcoach.com' }
  })

  if (existing) {
    console.log('✅ Usuário demo já existe:', existing)
    return
  }

  // Criar novo
  const user = await prisma.user.create({
    data: {
      email: 'gabriel@gymcoach.com',
      name: 'Gabriel (Demo)',
    }
  })
  
  console.log('✅ Usuário demo criado com sucesso!')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('   Nome:', user.name)
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
