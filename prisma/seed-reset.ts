import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('🗑️  Iniciando reset completo do banco de dados...')
  console.log('⚠️  ATENÇÃO: Todos os dados serão deletados!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Deletar todos os dados na ordem correta (respeitando foreign keys)
    console.log('📋 Deletando dados...')

    // 1. Deletar dados relacionados a membros primeiro (ordem respeitando foreign keys)
    await prisma.certificateValidation.deleteMany({})
    console.log('✅ Validações de certificados deletadas')

    await prisma.certificate.deleteMany({})
    console.log('✅ Certificados deletados')

    await prisma.memberCourse.deleteMany({})
    console.log('✅ Inscrições em cursos deletadas')

    await prisma.course.deleteMany({})
    console.log('✅ Cursos deletados')

    await prisma.attendance.deleteMany({})
    console.log('✅ Atendimentos deletados')

    await prisma.baptism.deleteMany({})
    console.log('✅ Batismos deletados')

    await prisma.discipleship.deleteMany({})
    console.log('✅ Discipulados deletados')

    await prisma.memberMinistry.deleteMany({})
    console.log('✅ Relações membro-ministério deletadas')

    await prisma.memberNeed.deleteMany({})
    console.log('✅ Necessidades de membros deletadas')

    await prisma.prayerRequest.deleteMany({})
    console.log('✅ Pedidos de oração deletados')

    await prisma.pastoralVisit.deleteMany({})
    console.log('✅ Visitas pastorais deletadas')

    await prisma.faithDecision.deleteMany({})
    console.log('✅ Decisões de fé deletadas')

    await prisma.memberConsent.deleteMany({})
    console.log('✅ Consentimentos de membros deletados')

    // 2. Deletar dados financeiros
    await prisma.budget.deleteMany({})
    console.log('✅ Orçamentos deletados')

    await prisma.payment.deleteMany({})
    console.log('✅ Pagamentos deletados')

    await prisma.donation.deleteMany({})
    console.log('✅ Doações deletadas')

    await prisma.finance.deleteMany({})
    console.log('✅ Finanças deletadas')

    // 3. Deletar eventos e ministérios
    await prisma.event.deleteMany({})
    console.log('✅ Eventos deletados')

    await prisma.ministryScheduleMember.deleteMany({})
    console.log('✅ Membros de escalas deletados')

    await prisma.ministrySchedule.deleteMany({})
    console.log('✅ Escalas de ministérios deletadas')

    await prisma.ministry.deleteMany({})
    console.log('✅ Ministérios deletados')

    // 4. Deletar patrimônio
    await prisma.asset.deleteMany({})
    console.log('✅ Patrimônio deletado')

    // 5. Deletar membros
    await prisma.member.deleteMany({})
    console.log('✅ Membros deletados')

    // 6. Deletar módulos customizados de igrejas
    await prisma.churchModule.deleteMany({})
    console.log('✅ Módulos customizados de igrejas deletados')

    // 7. Deletar planos e módulos de planos
    await prisma.planModule.deleteMany({})
    console.log('✅ Módulos de planos deletados')

    await prisma.plan.deleteMany({})
    console.log('✅ Planos deletados')

    await prisma.module.deleteMany({})
    console.log('✅ Módulos deletados')

    // 8. Deletar usuários (exceto se quiser manter algum)
    await prisma.user.deleteMany({})
    console.log('✅ Usuários deletados')

    // 9. Deletar igrejas
    await prisma.church.deleteMany({})
    console.log('✅ Igrejas deletadas')

    // 10. Deletar logs de auditoria
    await prisma.auditLog.deleteMany({})
    console.log('✅ Logs de auditoria deletados')

    // 11. Deletar solicitações LGPD
    await prisma.dataRequest.deleteMany({})
    console.log('✅ Solicitações LGPD deletadas')

    console.log('\n✅ Todos os dados foram deletados!\n')

    // Criar apenas o administrador da plataforma
    console.log('👤 Criando administrador da plataforma...')
    
    const adminPassword = await hashPassword('LinuxBraga2025@#')
    const platformAdmin = await prisma.user.create({
      data: {
        email: 'ofbsantos@gmail.com',
        name: 'Othon Felipe',
        password: adminPassword,
        role: 'ADMIN',
        active: true,
        isPlatformAdmin: true, // Acesso exclusivo à plataforma
        churchId: null, // Não está vinculado a uma igreja específica
      },
    })

    console.log('✅ Administrador da plataforma criado com sucesso!')
    console.log('\n📋 Credenciais de acesso:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔐 ADMINISTRADOR DA PLATAFORMA:')
    console.log(`   Nome: ${platformAdmin.name}`)
    console.log(`   Email: ${platformAdmin.email}`)
    console.log(`   Senha: LinuxBraga2025@#`)
    console.log(`   Acesso: Plataforma Multitenancy (/platform/login)`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✨ Reset concluído com sucesso!')
    console.log('💡 O banco de dados está limpo e pronto para uso.')
  } catch (error) {
    console.error('❌ Erro ao executar reset:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
