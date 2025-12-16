/**
 * Mapeamento de Rotas para Módulos
 * 
 * Este arquivo contém o mapeamento completo de todas as rotas do sistema
 * para seus respectivos módulos. Use este mapeamento para:
 * 
 * - Verificar se uma rota requer um módulo específico
 * - Listar todas as rotas de um módulo
 * - Validar se um módulo está configurado corretamente
 * - Obter o ícone correto para cada módulo
 */

export interface RouteModuleInfo {
  module: string
  description: string
  icon: string // Nome do ícone do lucide-react
  requiresAuth?: boolean
}

/**
 * Mapeamento de módulos para ícones (lucide-react)
 */
export const MODULE_ICONS: Record<string, string> = {
  MEMBERS: 'Users',
  FINANCES: 'DollarSign',
  MINISTRIES: 'Building2',
  ASSETS: 'Package',
  EVENTS: 'Calendar',
  COURSES: 'BookOpen',
  CERTIFICATES: 'Award',
  ANALYTICS: 'BarChart3',
  REPORTS: 'BarChart3',
  BUDGETS: 'Target',
  TRANSPARENCY: 'Eye',
  PASTORAL: 'Heart',
  DASHBOARD: 'LayoutDashboard',
  LEADERSHIP: 'UserCheck',
  MOBILE_APP: 'Smartphone',
}

/**
 * Mapeamento completo de rotas para módulos
 */
export const ROUTE_MODULE_MAP: Record<string, RouteModuleInfo> = {
  // Módulo MEMBERS
  '/dashboard/members': {
    module: 'MEMBERS',
    description: 'Gerenciamento de membros (CRUD básico)',
    icon: 'Users',
    requiresAuth: true,
  },
  '/dashboard/members/[id]': {
    module: 'MEMBERS',
    description: 'Detalhes do membro',
    icon: 'Users',
    requiresAuth: true,
  },
  '/dashboard/members/pending-consent': {
    module: 'MEMBERS',
    description: 'Membros pendentes de consentimento LGPD',
    icon: 'Users',
    requiresAuth: true,
  },
  
  // Módulo FINANCES
  '/dashboard/finances': {
    module: 'FINANCES',
    description: 'Gerenciamento de finanças (Dízimos e ofertas)',
    icon: 'DollarSign',
    requiresAuth: true,
  },
  '/dashboard/finances/reports': {
    module: 'REPORTS',
    description: 'Relatórios financeiros detalhados',
    icon: 'BarChart3',
    requiresAuth: true,
  },
  '/dashboard/finances/budgets': {
    module: 'BUDGETS',
    description: 'Gerenciamento de orçamentos',
    icon: 'Target',
    requiresAuth: true,
  },
  
  // Módulo MINISTRIES
  '/dashboard/ministries': {
    module: 'MINISTRIES',
    description: 'Gerenciamento de ministérios',
    icon: 'Building2',
    requiresAuth: true,
  },
  '/dashboard/ministries/[id]/schedules': {
    module: 'MINISTRIES',
    description: 'Agendamentos do ministério',
    icon: 'Building2',
    requiresAuth: true,
  },
  
  // Módulo ASSETS
  '/dashboard/assets': {
    module: 'ASSETS',
    description: 'Gerenciamento de patrimônio',
    icon: 'Package',
    requiresAuth: true,
  },
  '/dashboard/assets/[id]': {
    module: 'ASSETS',
    description: 'Detalhes do patrimônio',
    icon: 'Package',
    requiresAuth: true,
  },
  
  // Módulo EVENTS
  '/dashboard/events': {
    module: 'EVENTS',
    description: 'Gerenciamento de eventos',
    icon: 'Calendar',
    requiresAuth: true,
  },
  '/dashboard/events/[id]/attendances': {
    module: 'EVENTS',
    description: 'Presenças do evento',
    icon: 'Calendar',
    requiresAuth: true,
  },
  
  // Módulo COURSES
  '/dashboard/courses': {
    module: 'COURSES',
    description: 'Gerenciamento de cursos',
    icon: 'BookOpen',
    requiresAuth: true,
  },
  
  // Módulo CERTIFICATES
  '/dashboard/certificates': {
    module: 'CERTIFICATES',
    description: 'Gerenciamento de certificados',
    icon: 'Award',
    requiresAuth: true,
  },
  '/dashboard/certificates/[id]/validation-image': {
    module: 'CERTIFICATES',
    description: 'Imagem de validação do certificado',
    icon: 'Award',
    requiresAuth: true,
  },
  
  // Módulo ANALYTICS
  '/dashboard/analytics': {
    module: 'ANALYTICS',
    description: 'Análises e métricas do sistema',
    icon: 'BarChart3',
    requiresAuth: true,
  },
  
  // Módulo TRANSPARENCY
  '/transparency': {
    module: 'TRANSPARENCY',
    description: 'Portal de transparência',
    icon: 'Eye',
    requiresAuth: false, // Público
  },
  
  // Módulo PASTORAL
  '/dashboard/pastoral': {
    module: 'PASTORAL',
    description: 'Acompanhamento Pastoral',
    icon: 'Heart',
    requiresAuth: true,
  },
  '/dashboard/pastoral/visits': {
    module: 'PASTORAL',
    description: 'Visitas pastorais',
    icon: 'Heart',
    requiresAuth: true,
  },
  
  // Rotas sem módulo específico (sempre disponíveis)
  '/dashboard': {
    module: 'DASHBOARD',
    description: 'Dashboard principal',
    icon: 'LayoutDashboard',
    requiresAuth: true,
  },
  '/dashboard/leadership': {
    module: 'LEADERSHIP',
    description: 'Área de liderança (para líderes de ministérios)',
    icon: 'UserCheck',
    requiresAuth: true,
  },

  // Mapeamento de rotas de API para módulos
  '/api/members': { module: 'MEMBERS', description: 'API de membros', icon: 'Users', requiresAuth: true },
  '/api/ministries': { module: 'MINISTRIES', description: 'API de ministérios', icon: 'Building2', requiresAuth: true },
  '/api/finances': { module: 'FINANCES', description: 'API de finanças', icon: 'DollarSign', requiresAuth: true },
  '/api/donations': { module: 'FINANCES', description: 'API de doações', icon: 'DollarSign', requiresAuth: true },
  '/api/events': { module: 'EVENTS', description: 'API de eventos', icon: 'Calendar', requiresAuth: true },
  '/api/courses': { module: 'COURSES', description: 'API de cursos', icon: 'BookOpen', requiresAuth: true },
  '/api/certificates': { module: 'CERTIFICATES', description: 'API de certificados', icon: 'Award', requiresAuth: true },
  '/api/assets': { module: 'ASSETS', description: 'API de patrimônio', icon: 'Package', requiresAuth: true },
  '/api/analytics': { module: 'ANALYTICS', description: 'API de analytics', icon: 'BarChart3', requiresAuth: true },
  '/api/pastoral': { module: 'PASTORAL', description: 'API de acompanhamento pastoral', icon: 'Heart', requiresAuth: true },
}

/**
 * Obtém o módulo associado a uma rota (página ou API)
 */
export function getModuleForRoute(route: string): string | null {
  // Verificar rota exata primeiro
  if (ROUTE_MODULE_MAP[route]) {
    const module = ROUTE_MODULE_MAP[route].module
    console.log('[getModuleForRoute] Módulo encontrado (rota exata)', { route, module })
    return module
  }
  
  // Para rotas de API, verificar prefixos
  if (route.startsWith('/api/')) {
    // Verificar prefixos de API
    for (const [routePattern, info] of Object.entries(ROUTE_MODULE_MAP)) {
      if (routePattern.startsWith('/api/') && route.startsWith(routePattern)) {
        console.log('[getModuleForRoute] Módulo encontrado (prefixo API)', { route, routePattern, module: info.module })
        return info.module
      }
    }
  }
  
  // Usar função getRouteInfo para rotas de páginas
  const info = getRouteInfo(route)
  const module = info?.module || null
  
  if (module) {
    console.log('[getModuleForRoute] Módulo encontrado (getRouteInfo)', { route, module })
  } else {
    console.log('[getModuleForRoute] Nenhum módulo encontrado para rota', { route })
  }
  
  return module
}

/**
 * Obtém informações completas de uma rota (módulo, descrição, ícone)
 */
export function getRouteInfo(route: string): RouteModuleInfo | null {
  // Verificar rota exata primeiro
  if (ROUTE_MODULE_MAP[route]) {
    return ROUTE_MODULE_MAP[route]
  }
  
  // Verificar rotas com parâmetros dinâmicos
  for (const [routePattern, info] of Object.entries(ROUTE_MODULE_MAP)) {
    // Converter padrão de rota para regex
    // Exemplo: /dashboard/members/[id] -> ^\/dashboard\/members\/[^/]+$
    const regexPattern = routePattern
      .replace(/\[([^\]]+)\]/g, '[^/]+') // [id] -> [^/]+
      .replace(/\//g, '\\/') // / -> \/
    
    try {
      const regex = new RegExp(`^${regexPattern}$`)
      if (regex.test(route)) {
        return info
      }
    } catch (error) {
      // Se houver erro ao criar regex, pular este padrão
      console.warn(`[getRouteInfo] Erro ao criar regex para padrão: ${routePattern}`, error)
      continue
    }
  }
  
  // Verificar prefixos de rota (apenas para rotas que não são APIs)
  // APIs já foram verificadas em getModuleForRoute
  if (!route.startsWith('/api/')) {
    // Ordenar rotas por tamanho (mais específicas primeiro) para evitar correspondências incorretas
    const sortedRoutes = Object.entries(ROUTE_MODULE_MAP)
      .filter(([pattern]) => !pattern.startsWith('/api/'))
      .sort(([a], [b]) => b.length - a.length) // Rotas mais longas primeiro
    
    for (const [routePattern, info] of sortedRoutes) {
      // Verificar se a rota começa com o padrão
      // Mas evitar correspondências muito genéricas (ex: /dashboard correspondendo a tudo)
      if (route.startsWith(routePattern)) {
        // Verificar se é uma correspondência exata ou se o próximo caractere é / ou fim da string
        const nextChar = route[routePattern.length]
        if (!nextChar || nextChar === '/') {
          return info
        }
      }
    }
  }
  
  return null
}

/**
 * Obtém o ícone de um módulo
 */
export function getModuleIcon(moduleKey: string): string {
  return MODULE_ICONS[moduleKey] || 'LayoutDashboard'
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
 * Lista todos os módulos com suas informações completas (rotas, ícones, descrições)
 */
export function getAllModulesWithInfo(): Record<string, {
  routes: string[]
  icon: string
  description: string
}> {
  const modules: Record<string, {
    routes: string[]
    icon: string
    description: string
  }> = {}
  
  for (const [route, info] of Object.entries(ROUTE_MODULE_MAP)) {
    if (!modules[info.module]) {
      modules[info.module] = {
        routes: [],
        icon: info.icon,
        description: info.description,
      }
    }
    modules[info.module].routes.push(route)
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
