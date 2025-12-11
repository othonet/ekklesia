/**
 * Sistema de Permissões por Role
 * Define quais recursos cada role pode acessar
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  PASTOR_PRESIDENTE = 'PASTOR_PRESIDENTE',
  SECRETARIO = 'SECRETARIO',
  TESOUREIRO = 'TESOUREIRO',
  PASTOR = 'PASTOR',
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

export type Permission = 
  | 'members:read'
  | 'members:write'
  | 'events:read'
  | 'events:write'
  | 'courses:read'
  | 'courses:write'
  | 'certificates:read'
  | 'certificates:write'
  | 'finances:read'
  | 'finances:write'
  | 'assets:read'
  | 'assets:write'
  | 'analytics:read'
  | 'reports:read'
  | 'budgets:read'
  | 'budgets:write'
  | 'ministries:read'
  | 'ministries:write'
  | 'transparency:read'
  | 'dashboard:read'

/**
 * Permissões por role
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin da plataforma tem acesso total
    'members:read',
    'members:write',
    'events:read',
    'events:write',
    'courses:read',
    'courses:write',
    'certificates:read',
    'certificates:write',
    'finances:read',
    'finances:write',
    'assets:read',
    'assets:write',
    'analytics:read',
    'reports:read',
    'budgets:read',
    'budgets:write',
    'ministries:read',
    'ministries:write',
    'transparency:read',
    'dashboard:read',
  ],
  [UserRole.PASTOR_PRESIDENTE]: [
    // Pastor presidente - acesso total à administração da igreja
    'members:read',
    'members:write',
    'events:read',
    'events:write',
    'courses:read',
    'courses:write',
    'certificates:read',
    'certificates:write',
    'finances:read',
    'finances:write',
    'assets:read',
    'assets:write',
    'analytics:read',
    'reports:read',
    'budgets:read',
    'budgets:write',
    'ministries:read',
    'ministries:write',
    'transparency:read',
    'dashboard:read',
  ],
  [UserRole.SECRETARIO]: [
    // Secretário(a) - membros, eventos, cursos, certificados
    'members:read',
    'members:write',
    'events:read',
    'events:write',
    'courses:read',
    'courses:write',
    'certificates:read',
    'certificates:write',
    'transparency:read',
    'dashboard:read',
  ],
  [UserRole.TESOUREIRO]: [
    // Tesoureiro(a) - finanças, patrimônio, analytics, relatórios, orçamentos
    'finances:read',
    'finances:write',
    'assets:read',
    'assets:write',
    'analytics:read',
    'reports:read',
    'budgets:read',
    'budgets:write',
    'transparency:read',
    'dashboard:read',
  ],
  [UserRole.PASTOR]: [
    // Pastor (compatibilidade) - acesso similar ao pastor presidente
    'members:read',
    'members:write',
    'events:read',
    'events:write',
    'courses:read',
    'courses:write',
    'certificates:read',
    'certificates:write',
    'finances:read',
    'finances:write',
    'assets:read',
    'assets:write',
    'analytics:read',
    'reports:read',
    'budgets:read',
    'budgets:write',
    'ministries:read',
    'ministries:write',
    'transparency:read',
    'dashboard:read',
  ],
  [UserRole.LEADER]: [
    // Líder (compatibilidade) - acesso limitado
    'members:read',
    'events:read',
    'courses:read',
    'certificates:read',
    'ministries:read',
    'transparency:read',
    'dashboard:read',
  ],
  [UserRole.MEMBER]: [
    // Membro comum - apenas transparência
    'transparency:read',
  ],
}

/**
 * Verifica se um role tem uma permissão específica
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const roleEnum = role as UserRole
  const permissions = ROLE_PERMISSIONS[roleEnum] || []
  return permissions.includes(permission)
}

/**
 * Verifica se um role tem acesso a um módulo
 */
export function hasModuleAccess(role: string, module: string): boolean {
  const roleEnum = role as UserRole
  
  // Mapeamento de módulos para permissões
  const modulePermissions: Record<string, Permission[]> = {
    members: ['members:read'],
    events: ['events:read'],
    courses: ['courses:read'],
    certificates: ['certificates:read'],
    finances: ['finances:read'],
    assets: ['assets:read'],
    analytics: ['analytics:read'],
    reports: ['reports:read'],
    budgets: ['budgets:read'],
    ministries: ['ministries:read'],
    transparency: ['transparency:read'],
    pastoral: ['members:read'], // Acompanhamento pastoral usa permissão de membros
  }

  const requiredPermissions = modulePermissions[module] || []
  if (requiredPermissions.length === 0) return false

  return requiredPermissions.some(perm => hasPermission(role, perm))
}

/**
 * Verifica se um role pode acessar uma rota específica
 */
export function canAccessRoute(role: string, route: string): boolean {
  const roleEnum = role as UserRole

  // Rotas públicas
  if (route.startsWith('/transparency')) {
    return hasPermission(role, 'transparency:read')
  }

  // Rotas do dashboard
  if (route.startsWith('/dashboard')) {
    if (route.includes('/members')) {
      return hasPermission(role, 'members:read')
    }
    if (route.includes('/events')) {
      return hasPermission(role, 'events:read')
    }
    if (route.includes('/courses')) {
      return hasPermission(role, 'courses:read')
    }
    if (route.includes('/certificates')) {
      return hasPermission(role, 'certificates:read')
    }
    if (route.includes('/finances')) {
      return hasPermission(role, 'finances:read')
    }
    if (route.includes('/assets')) {
      return hasPermission(role, 'assets:read')
    }
    if (route.includes('/analytics')) {
      return hasPermission(role, 'analytics:read')
    }
    if (route.includes('/reports')) {
      return hasPermission(role, 'reports:read')
    }
    if (route.includes('/budgets')) {
      return hasPermission(role, 'budgets:read')
    }
    if (route.includes('/ministries')) {
      return hasPermission(role, 'ministries:read')
    }
    
    // Dashboard principal
    if (route === '/dashboard' || route === '/dashboard/') {
      return hasPermission(role, 'dashboard:read')
    }
  }

  return false
}

/**
 * Obtém todas as permissões de um role
 */
export function getRolePermissions(role: string): Permission[] {
  const roleEnum = role as UserRole
  return ROLE_PERMISSIONS[roleEnum] || []
}

/**
 * Verifica se um membro é líder de algum ministério
 */
export async function isMinistryLeader(memberId: string, prisma: any): Promise<boolean> {
  const ministry = await prisma.ministry.findFirst({
    where: {
      leaderId: memberId,
    },
  })
  return !!ministry
}

/**
 * Verifica se um membro é dizimista ou ofertante (tem doações)
 */
export async function isTitherOrGiver(memberId: string, prisma: any): Promise<boolean> {
  const donation = await prisma.donation.findFirst({
    where: {
      memberId,
      status: 'COMPLETED',
    },
  })
  return !!donation
}

