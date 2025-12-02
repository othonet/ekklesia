/**
 * Script para verificar e atualizar o role de um usuário
 * 
 * Uso: npx tsx scripts/check-user-role.ts <email> [ADMIN|PASTOR|LEADER|MEMBER]
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const newRole = process.argv[3]?.toUpperCase()

  if (!email) {
    console.error('❌ Erro: Email é obrigatório')
    console.log('Uso: npx tsx scripts/check-user-role.ts <email> [ADMIN|PASTOR|LEADER|MEMBER]')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        churchId: true,
        church: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!user) {
      console.error(`❌ Usuário não encontrado: ${email}`)
      process.exit(1)
    }

    console.log('\n📋 Informações do Usuário:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Nome:     ${user.name}`)
    console.log(`Email:    ${user.email}`)
    console.log(`Role:     ${user.role}`)
    console.log(`Ativo:    ${user.active ? 'Sim' : 'Não'}`)
    console.log(`Igreja:   ${user.church?.name || 'N/A'}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    if (newRole) {
      const validRoles = ['ADMIN', 'PASTOR', 'LEADER', 'MEMBER']
      if (!validRoles.includes(newRole)) {
        console.error(`❌ Role inválido: ${newRole}`)
        console.log(`Roles válidos: ${validRoles.join(', ')}`)
        process.exit(1)
      }

      if (user.role === newRole) {
        console.log(`✅ O usuário já possui o role ${newRole}`)
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: newRole as any },
        })
        console.log(`✅ Role atualizado de ${user.role} para ${newRole}`)
      }
    } else {
      console.log('💡 Para atualizar o role, execute:')
      console.log(`   npx tsx scripts/check-user-role.ts ${email} ADMIN`)
    }
  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

