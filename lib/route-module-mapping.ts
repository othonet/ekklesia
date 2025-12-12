/**
 * Mapeamento de Rotas para Módulos
 * 
 * Este arquivo contém o mapeamento completo de todas as rotas do sistema
 * para seus respectivos módulos. Use este mapeamento para:
 * 
 * - Verificar se uma rota requer um módulo específico
 * - Listar todas as rotas de um módulo
 * - Validar se um módulo está configurado corretamente
 */

export interface RouteModuleInfo {
  module: string
  description: string
  requiresAuth?: boolean
}

/**
 * Mapeamento completo de rotas para módulos
 */
export const ROUTE_MODULE_MAP: Record<string, RouteModuleInfo> = {
  // Módulo MEMBERS
  '/dashboard/members': {
    module: 'MEMBERS',
    description: 'Gerenciamento de membros (CRUD básico)',
    requiresAuth: true,
  },
  '/dashboard/members/[id]': {
    module: 'MEMBERS',
    description: 'Detalhes do membro',
    requiresAuth: true,
  },
  '/dashboard/members/pending-consent': {
    module: 'MEMBERS',
    description: 'Membros pendentes de consentimento LGPD',
    requiresAuth: true,
  },
  
  // Módulo FINANCES
  '/dashboard/finances': {
    module: 'FINANCES',
    description: 'Gerenciamento de finanças (Dízimos e ofertas)',
    requiresAuth: true,
  },
  '/dashboard/finances/reports': {
    module: 'REPORTS',
    description: 'Relatórios financeiros detalhados',
    requiresAuth: true,
  },
  '/dashboard/finances/budgets': {
    module: 'BUDGETS',
    description: 'Gerenciamento de orçamentos',
    requiresAuth: true,
  },
  
  // Módulo MINISTRIES
  '/dashboard/ministries': {
    module: 'MINISTRIES',
    description: 'Gerenciamento de ministérios',
    requiresAuth: true,
  },
  '/dashboard/ministries/[id]/schedules': {
    module: 'MINISTRIES',
    description: 'Agendamentos do ministério',
    requiresAuth: true,
  },
  
  // Módulo ASSETS
  '/dashboard/assets': {
    module: 'ASSETS',
    description: 'Gerenciamento de patrimônio',
    requiresAuth: true,
  },
  '/dashboard/assets/[id]': {
    module: 'ASSETS',
    description: 'Detalhes do patrimônio',
    requiresAuth: true,
  },
  
  // Módulo EVENTS
  '/dashboard/events': {
    module: 'EVENTS',
    description: 'Gerenciamento de eventos',
    requiresAuth: true,
  },
  '/dashboard/events/[id]/attendances': {
    module: 'EVENTS',
    description: 'Presenças do evento',
    requiresAuth: true,
  },
  
  // Módulo COURSES
  '/dashboard/courses': {
    module: 'COURSES',
    description: 'Gerenciamento de cursos',
    requiresAuth: true,
  },
  
  // Módulo CERTIFICATES
  '/dashboard/certificates': {
    module: 'CERTIFICATES',
    description: 'Gerenciamento de certificados',
    requiresAuth: true,
  },
  '/dashboard/certificates/[id]/validation-image': {
    module: 'CERTIFICATES',
    description: 'Imagem de validação do certificado',
    requiresAuth: true,
  },
  
  // Módulo ANALYTICS
  '/dashboard/analytics': {
    module: 'ANALYTICS',
    description: 'Análises e métricas do sistema',
    requiresAuth: true,
  },
  
  // Módulo TRANSPARENCY
  '/transparency': {
    module: 'TRANSPARENCY',
    description: 'Portal de transparência',
    requiresAuth: false, // Público
  },
  
  // Módulo PASTORAL
  '/dashboard/pastoral': {
    module: 'PASTORAL',
    description: 'Acompanhamento Pastoral',
    requiresAuth: true,
  },
  '/dashboard/pastoral/visits': {
    module: 'PASTORAL',
    description: 'Visitas pastorais',
    requiresAuth: true,
  },
  
  // Rotas sem módulo específico (sempre disponíveis)
  '/dashboard': {
    module: 'DASHBOARD',
    description: 'Dashboard principal',
    requiresAuth: true,
  },
  '/dashboard/leadership': {
    module: 'LEADERSHIP',
    description: 'Área de liderança (para líderes de ministérios)',
    requiresAuth: true,
  },
}

/**
 * Obtém o módulo associado a uma rota
 */
export function getModuleForRoute(route: string): string | null {
  // Verificar rota exata primeiro
  if (ROUTE_MODULE_MAP[route]) {
    return ROUTE_MODULE_MAP[route].module
  }
  
  // Verificar rotas com parâmetros dinâmicos
  for (const [routePattern, info] of Object.entries(ROUTE_MODULE_MAP)) {
    // Converter padrão de rota para regex
    const regexPattern = routePattern
      .replace(/\[([^\]]+)\]/g, '[^/]+') // [id] -> [^/]+
      .replace(/\//g, '\\/') // / -> \/
    
    const regex = new RegExp(`^${regexPattern}$`)
    if (regex.test(route)) {
      return info.module
    }
  }
  
  // Verificar prefixos de rota
  for (const [routePattern, info] of Object.entries(ROUTE_MODULE_MAP)) {
    if (route.startsWith(routePattern)) {
      return info.module
    }
  }
  
  return null
}

/**
 * Obtém todas as rotas de um módulo específico
 */
export function getRoutesForModule(moduleKey: string): string[] {
  return Object.entries(ROUTE_MODULE_MAP)
    .filter(([_, info]) => info.module === moduleKey)
    .map(([route]) => route)
}

/**
 * Lista todos os módulos únicos e suas rotas
 */
export function getAllModulesWithRoutes(): Record<string, string[]> {
  const modules: Record<string, string[]> = {}
  
  for (const [route, info] of Object.entries(ROUTE_MODULE_MAP)) {
    if (!modules[info.module]) {
      modules[info.module] = []
    }
    modules[info.module].push(route)
  }
  
  return modules
}

/**
 * Verifica se uma rota requer autenticação
 */
export function routeRequiresAuth(route: string): boolean {
  const info = ROUTE_MODULE_MAP[route]
  return info?.requiresAuth ?? true // Por padrão, requer autenticação
}
