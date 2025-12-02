import { prisma } from './prisma'

/**
 * Chaves dos módulos do sistema
 */
export const MODULE_KEYS = {
  MEMBERS: 'MEMBERS',
  FINANCES: 'FINANCES',
  MINISTRIES: 'MINISTRIES',
  ASSETS: 'ASSETS',
  EVENTS: 'EVENTS',
  COURSES: 'COURSES',
  CERTIFICATES: 'CERTIFICATES',
  ANALYTICS: 'ANALYTICS',
  REPORTS: 'REPORTS',
  BUDGETS: 'BUDGETS',
  TRANSPARENCY: 'TRANSPARENCY',
  MOBILE_APP: 'MOBILE_APP', // App para membros
} as const

export type ModuleKey = typeof MODULE_KEYS[keyof typeof MODULE_KEYS]

/**
 * Verifica se uma igreja tem acesso a um módulo específico
 */
export async function hasModuleAccess(
  churchId: string,
  moduleKey: ModuleKey
): Promise<boolean> {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      include: {
        plan: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })

    if (!church || !church.plan) {
      return false
    }

    // Verificar se o plano está ativo e não expirou
    if (!church.plan.active) {
      return false
    }

    if (church.planExpiresAt && church.planExpiresAt < new Date()) {
      return false
    }

    // Verificar se o módulo está no plano
    const hasModule = church.plan.modules.some(
      (pm) => pm.module.key === moduleKey && pm.module.active
    )

    return hasModule
  } catch (error) {
    console.error('Erro ao verificar acesso ao módulo:', error)
    return false
  }
}

/**
 * Obtém todos os módulos disponíveis para uma igreja
 */
export async function getChurchModules(churchId: string) {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      include: {
        plan: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })

    if (!church || !church.plan) {
      return []
    }

    // Verificar se o plano está ativo e não expirou
    if (!church.plan.active) {
      return []
    }

    if (church.planExpiresAt && church.planExpiresAt < new Date()) {
      return []
    }

    // Filtrar módulos ativos e ordenar
    return church.plan.modules
      .filter((pm) => pm.module.active)
      .map((pm) => pm.module)
      .sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Erro ao obter módulos da igreja:', error)
    return []
  }
}

/**
 * Verifica se uma igreja tem acesso ao app mobile
 */
export async function hasMobileAppAccess(churchId: string): Promise<boolean> {
  return hasModuleAccess(churchId, MODULE_KEYS.MOBILE_APP)
}

/**
 * Obtém o plano de uma igreja
 */
export async function getChurchPlan(churchId: string) {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      include: {
        plan: {
          include: {
            modules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })

    return church?.plan || null
  } catch (error) {
    console.error('Erro ao obter plano da igreja:', error)
    return null
  }
}

