import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar módulos do sistema
  console.log('📦 Criando módulos...')
  const modules = [
    { key: 'MEMBERS', name: 'Membros', description: 'Gerenciamento de membros (CRUD básico)', icon: 'Users', route: '/dashboard/members', order: 1 },
    { key: 'FINANCES', name: 'Finanças', description: 'Gerenciamento de finanças (Dízimos e ofertas)', icon: 'DollarSign', route: '/dashboard/finances', order: 2 },
    { key: 'MINISTRIES', name: 'Ministérios', description: 'Gerenciamento de ministérios', icon: 'Building2', route: '/dashboard/ministries', order: 3 },
    { key: 'ASSETS', name: 'Patrimônio', description: 'Gerenciamento de patrimônio', icon: 'Package', route: '/dashboard/assets', order: 4 },
    { key: 'EVENTS', name: 'Eventos', description: 'Gerenciamento de eventos', icon: 'Calendar', route: '/dashboard/events', order: 5 },
    { key: 'COURSES', name: 'Cursos', description: 'Gerenciamento de cursos', icon: 'BookOpen', route: '/dashboard/courses', order: 6 },
    { key: 'CERTIFICATES', name: 'Certificados', description: 'Gerenciamento de certificados', icon: 'Award', route: '/dashboard/certificates', order: 7 },
    { key: 'ANALYTICS', name: 'Analytics', description: 'Análises e métricas do sistema', icon: 'BarChart3', route: '/dashboard/analytics', order: 8 },
    { key: 'REPORTS', name: 'Relatórios Financeiros', description: 'Relatórios financeiros detalhados', icon: 'BarChart3', route: '/dashboard/finances/reports', order: 9 },
    { key: 'BUDGETS', name: 'Orçamentos', description: 'Gerenciamento de orçamentos', icon: 'Target', route: '/dashboard/finances/budgets', order: 10 },
    { key: 'TRANSPARENCY', name: 'Transparência', description: 'Portal de transparência', icon: 'Eye', route: '/transparency', order: 11 },
    { key: 'PASTORAL', name: 'Acompanhamento Pastoral', description: 'Visitas pastorais, pedidos de oração e necessidades', icon: 'Heart', route: '/dashboard/pastoral', order: 12 },
    { key: 'MOBILE_APP', name: 'App para Membros', description: 'Acesso ao aplicativo mobile para membros', icon: 'Smartphone', route: null, order: 13 },
  ]

  const createdModules = []
  for (const moduleData of modules) {
    const createdModule = await prisma.module.upsert({
      where: { key: moduleData.key },
      update: {
        name: moduleData.name,
        description: moduleData.description,
        icon: moduleData.icon,
        route: moduleData.route,
        order: moduleData.order,
      },
      create: moduleData,
    })
    createdModules.push(createdModule)
  }
  console.log(`✅ ${createdModules.length} módulos criados`)

  // Criar planos
  console.log('💎 Criando planos...')
  
  // Plano Básico
  const basicPlan = await prisma.plan.upsert({
    where: { key: 'BASIC' },
    update: {},
    create: {
      key: 'BASIC',
      name: 'Plano Básico',
      description: 'Plano básico com gerenciamento de membros e finanças',
      price: 0,
      modules: {
        create: [
          { moduleId: createdModules.find(m => m.key === 'MEMBERS')!.id },
          { moduleId: createdModules.find(m => m.key === 'FINANCES')!.id },
        ],
      },
    },
    include: {
      modules: {
        include: {
          module: true,
        },
      },
    },
  })
  console.log('✅ Plano Básico criado')

  // Plano Intermediário
  const intermediatePlan = await prisma.plan.upsert({
    where: { key: 'INTERMEDIATE' },
    update: {},
    create: {
      key: 'INTERMEDIATE',
      name: 'Plano Intermediário',
      description: 'Plano intermediário com membros, finanças, ministérios e patrimônio',
      price: 0,
      modules: {
        create: [
          { moduleId: createdModules.find(m => m.key === 'MEMBERS')!.id },
          { moduleId: createdModules.find(m => m.key === 'FINANCES')!.id },
          { moduleId: createdModules.find(m => m.key === 'MINISTRIES')!.id },
          { moduleId: createdModules.find(m => m.key === 'ASSETS')!.id },
        ],
      },
    },
    include: {
      modules: {
        include: {
          module: true,
        },
      },
    },
  })
  console.log('✅ Plano Intermediário criado')

  // Plano Master
  const masterPlan = await prisma.plan.upsert({
    where: { key: 'MASTER' },
    update: {},
    create: {
      key: 'MASTER',
      name: 'Plano Master',
      description: 'Plano completo com todas as funcionalidades, incluindo app para membros',
      price: 0,
      modules: {
        create: createdModules.map(m => ({ moduleId: m.id })),
      },
    },
    include: {
      modules: {
        include: {
          module: true,
        },
      },
    },
  })
  console.log('✅ Plano Master criado')

  // Adicionar módulo PASTORAL aos planos Master (se existir)
  const pastoralModule = createdModules.find((m) => m.key === 'PASTORAL')
  if (pastoralModule) {
    await prisma.planModule.upsert({
      where: {
        planId_moduleId: {
          planId: masterPlan.id,
          moduleId: pastoralModule.id,
        },
      },
      update: {},
      create: {
        planId: masterPlan.id,
        moduleId: pastoralModule.id,
      },
    })
    console.log('✅ Módulo PASTORAL adicionado ao plano Master')
  }

  // Criar igreja padrão com plano Master
  const church = await prisma.church.upsert({
    where: { id: 'church-default' },
    update: {
      planId: masterPlan.id,
      planAssignedAt: new Date(),
    },
    create: {
      id: 'church-default',
      name: 'Igreja Exemplo',
      email: 'contato@igrejaexemplo.com',
      phone: '(00) 0000-0000',
      city: 'São Paulo',
      state: 'SP',
      pastorName: 'Pastor Exemplo',
      planId: masterPlan.id,
      planAssignedAt: new Date(),
    },
  })

  console.log('✅ Igreja criada:', church.name)

  // Criar usuário admin da plataforma (super admin)
  const platformAdminPassword = await hashPassword('platform123')
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'platform@ekklesia.com' },
    update: {},
    create: {
      email: 'platform@ekklesia.com',
      name: 'Administrador da Plataforma',
      password: platformAdminPassword,
      role: 'ADMIN',
      active: true,
      isPlatformAdmin: true, // Acesso exclusivo à plataforma
      churchId: null, // Não está vinculado a uma igreja específica
    },
  })

  console.log('✅ Usuário admin da plataforma criado:', platformAdmin.email)

  // Criar usuário admin da igreja
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ekklesia.com' },
    update: {},
    create: {
      email: 'admin@ekklesia.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      active: true,
      isPlatformAdmin: false, // Não pode acessar a plataforma
      churchId: church.id,
    },
  })

  console.log('✅ Usuário admin da igreja criado:', admin.email)

  // Criar usuário pastor de exemplo
  const pastorPassword = await hashPassword('pastor123')
  const pastor = await prisma.user.upsert({
    where: { email: 'pastor@ekklesia.com' },
    update: {},
    create: {
      email: 'pastor@ekklesia.com',
      name: 'Pastor Exemplo',
      password: pastorPassword,
      role: 'PASTOR',
      active: true,
      churchId: church.id,
    },
  })

  console.log('✅ Usuário pastor criado:', pastor.email)

  console.log('\n📋 Credenciais de acesso:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔐 PLATAFORMA MULTITENANCY:')
  console.log('   Email: platform@ekklesia.com')
  console.log('   Senha: platform123')
  console.log('   Acesso: Plataforma Multitenancy')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 ADMIN DA IGREJA:')
  console.log('   Email: admin@ekklesia.com')
  console.log('   Senha: admin123')
  console.log('   Acesso: Dashboard da Igreja')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 PASTOR:')
  console.log('   Email: pastor@ekklesia.com')
  console.log('   Senha: pastor123')
  console.log('   Acesso: Dashboard da Igreja')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✨ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

