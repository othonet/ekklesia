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
      console.log('[hasModuleAccess] Igreja não encontrada', { churchId, moduleKey })
      return false
    }

    // Log inicial para debug
    console.log('[hasModuleAccess] Dados da igreja carregados', {
      churchId,
      moduleKey,
      hasPlan: !!church.plan,
      planId: church.plan?.id,
      planKey: church.plan?.key,
      planActive: church.plan?.active,
      customModulesCount: church.customModules.length,
      customModules: church.customModules.map(cm => ({
        id: cm.id,
        moduleKey: cm.module.key,
        moduleActive: cm.module.active,
        customModuleActive: cm.active,
        expiresAt: cm.expiresAt
      }))
    })

    // 1. Verificar módulos individuais atribuídos (tem prioridade sobre o plano)
    // Normalizar a chave do módulo para comparação (trim e uppercase)
    const normalizedModuleKey = moduleKey.trim().toUpperCase()
    
    // Primeiro, buscar todos os módulos individuais para este módulo (para debug)
    const allCustomModulesForThisKey = church.customModules.filter(
      (cm) => cm.module.key.trim().toUpperCase() === normalizedModuleKey
    )
    
    console.log('[hasModuleAccess] Módulos individuais encontrados para a chave', {
      churchId,
      moduleKey,
      normalizedModuleKey,
      found: allCustomModulesForThisKey.length,
      modules: allCustomModulesForThisKey.map(cm => ({
        id: cm.id,
        active: cm.active,
        moduleActive: cm.module.active,
        moduleKey: cm.module.key,
        normalizedKey: cm.module.key.trim().toUpperCase(),
        expiresAt: cm.expiresAt
      }))
    })
    
    const customModule = church.customModules.find(
      (cm) => cm.module.key.trim().toUpperCase() === normalizedModuleKey && cm.active && cm.module.active
    )

    if (customModule) {
      // Verificar se não expirou
      const now = new Date()
      const isExpired = customModule.expiresAt && customModule.expiresAt < now
      
      if (!isExpired) {
        // Módulo individual ativo e não expirado
        console.log('[hasModuleAccess] ✅ Acesso permitido via módulo individual', {
          churchId,
          moduleKey,
          customModuleId: customModule.id,
          active: customModule.active,
          moduleActive: customModule.module.active,
          expiresAt: customModule.expiresAt
        })
        return true
      } else {
        // Módulo expirado, continuar para verificar se tem no plano
        console.log('[hasModuleAccess] ⚠️ Módulo individual expirado, verificando plano', {
          churchId,
          moduleKey,
          expiresAt: customModule.expiresAt,
          now
        })
      }
    } else {
      // Verificar se existe módulo individual mas está inativo
      const inactiveCustomModule = church.customModules.find(
        (cm) => cm.module.key.trim().toUpperCase() === normalizedModuleKey
      )
      
      if (inactiveCustomModule) {
        console.log('[hasModuleAccess] ⚠️ Módulo individual encontrado mas inativo', {
          churchId,
          moduleKey,
          customModuleActive: inactiveCustomModule.active,
          moduleActive: inactiveCustomModule.module.active,
          customModuleId: inactiveCustomModule.id
        })
      } else {
        console.log('[hasModuleAccess] ❌ Nenhum módulo individual encontrado', {
          churchId,
          moduleKey,
          customModulesCount: church.customModules.length,
          customModulesKeys: church.customModules.map(cm => ({ 
            key: cm.module.key, 
            active: cm.active, 
            moduleActive: cm.module.active 
          }))
        })
      }
    }

    // 2. Verificar módulos do plano (se não encontrou individual ou expirou)
    if (!church.plan) {
      console.log('[hasModuleAccess] ❌ Igreja não tem plano atribuído e não tem módulo individual ativo', { 
        churchId, 
        moduleKey,
        hasCustomModules: church.customModules.length > 0
      })
      return false
    }

    // Verificar se o plano está ativo e não expirou
    if (!church.plan.active) {
      console.log('[hasModuleAccess] Plano não está ativo', {
        churchId,
        moduleKey,
        planId: church.plan.id,
        planActive: church.plan.active
      })
      return false
    }

    const now = new Date()
    if (church.planExpiresAt && church.planExpiresAt < now) {
      console.log('[hasModuleAccess] Plano expirado', {
        churchId,
        moduleKey,
        planId: church.plan.id,
        planExpiresAt: church.planExpiresAt,
        now
      })
      return false
    }

    // Verificar se o módulo está no plano
    const matchingPlanModule = church.plan.modules.find(
      (pm) => pm.module.key.trim().toUpperCase() === normalizedModuleKey
    )
    
    const hasModuleInPlan = matchingPlanModule 
      ? matchingPlanModule.module.active 
      : false

    console.log('[hasModuleAccess] Verificação do plano', {
      churchId,
      moduleKey,
      planId: church.plan.id,
      planKey: church.plan.key,
      planModulesCount: church.plan.modules.length,
      planModulesKeys: church.plan.modules.map(pm => ({
        key: pm.module.key,
        active: pm.module.active,
        moduleId: pm.module.id
      })),
      matchingPlanModule: matchingPlanModule ? {
        key: matchingPlanModule.module.key,
        active: matchingPlanModule.module.active,
        moduleId: matchingPlanModule.module.id
      } : null,
      hasModuleInPlan
    })

    return hasModuleInPlan
  } catch (error) {
    console.error('[hasModuleAccess] Erro ao verificar acesso ao módulo:', error)
    console.error('[hasModuleAccess] Stack trace:', error instanceof Error ? error.stack : 'N/A')
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

