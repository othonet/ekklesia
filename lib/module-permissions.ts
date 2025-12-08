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
  PASTORAL: 'PASTORAL', // Acompanhamento Pastoral
  MOBILE_APP: 'MOBILE_APP', // App para membros
} as const

export type ModuleKey = typeof MODULE_KEYS[keyof typeof MODULE_KEYS]

/**
 * Verifica se uma igreja tem acesso a um módulo específico
 * Considera tanto módulos do plano quanto módulos individuais atribuídos
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
        customModules: {
          include: {
            module: true,
          },
        },
      },
    })

    if (!church) {
      return false
    }

    // 1. Verificar módulos individuais atribuídos (tem prioridade sobre o plano)
    const customModule = church.customModules.find(
      (cm) => cm.module.key === moduleKey && cm.active && cm.module.active
    )

    if (customModule) {
      // Verificar se não expirou
      if (customModule.expiresAt && customModule.expiresAt < new Date()) {
        // Módulo expirado, verificar se tem no plano
      } else {
        // Módulo individual ativo e não expirado
        return true
      }
    }

    // 2. Verificar módulos do plano (se não encontrou individual ou expirou)
    if (!church.plan) {
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
    const hasModuleInPlan = church.plan.modules.some(
      (pm) => pm.module.key === moduleKey && pm.module.active
    )

    return hasModuleInPlan
  } catch (error) {
    console.error('Erro ao verificar acesso ao módulo:', error)
    return false
  }
}

/**
 * Obtém todos os módulos disponíveis para uma igreja
 * Combina módulos do plano com módulos individuais atribuídos
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
        customModules: {
          include: {
            module: true,
          },
        },
      },
    })

    if (!church) {
      return []
    }

    const modulesMap = new Map<string, any>()

    // 1. Adicionar módulos individuais (têm prioridade)
    const now = new Date()
    church.customModules
      .filter((cm) => {
        // Módulo ativo, não expirado e módulo base ativo
        return (
          cm.active &&
          cm.module.active &&
          (!cm.expiresAt || cm.expiresAt >= now)
        )
      })
      .forEach((cm) => {
        modulesMap.set(cm.module.key, {
          ...cm.module,
          source: 'custom', // Indica que é módulo individual
          expiresAt: cm.expiresAt,
        })
      })

    // 2. Adicionar módulos do plano (se plano ativo e não expirado)
    if (church.plan && church.plan.active) {
      const planExpired = church.planExpiresAt && church.planExpiresAt < new Date()
      
      if (!planExpired) {
        church.plan.modules
          .filter((pm) => pm.module.active)
          .forEach((pm) => {
            // Só adiciona se não foi sobrescrito por módulo individual
            if (!modulesMap.has(pm.module.key)) {
              modulesMap.set(pm.module.key, {
                ...pm.module,
                source: 'plan', // Indica que vem do plano
              })
            }
          })
      }
    }

    // Converter para array e ordenar
    return Array.from(modulesMap.values()).sort((a, b) => a.order - b.order)
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

