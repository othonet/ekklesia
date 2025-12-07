import { NextRequest } from 'next/server'
import { getCurrentUser } from './api-helpers'
import { prisma } from './prisma'
import { hasPermission, canAccessRoute, Permission, isMinistryLeader, isTitherOrGiver } from './permissions'

/**
 * Verifica se o usuário atual tem uma permissão específica
 */
export async function checkPermission(request: NextRequest, permission: Permission): Promise<boolean> {
  const user = getCurrentUser(request)
  if (!user || !user.role) return false
  
  return hasPermission(user.role, permission)
}

/**
 * Verifica se o usuário atual pode acessar uma rota
 */
export async function checkRouteAccess(request: NextRequest, route: string): Promise<boolean> {
  const user = getCurrentUser(request)
  if (!user || !user.role) return false
  
  return canAccessRoute(user.role, route)
}

/**
 * Verifica se o usuário atual tem acesso a um módulo
 */
export async function checkModuleAccess(request: NextRequest, module: string): Promise<boolean> {
  const user = getCurrentUser(request)
  if (!user || !user.role) return false
  
  const { hasModuleAccess } = await import('./permissions')
  return hasModuleAccess(user.role, module)
}

/**
 * Verifica se um membro (via token JWT) é líder de ministério
 */
export async function checkMinistryLeader(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.substring(7)
    const { verifyMemberToken } = await import('./auth')
    const payload = verifyMemberToken(token)
    
    if (!payload || !payload.memberId) {
      return false
    }

    return await isMinistryLeader(payload.memberId, prisma)
  } catch (error) {
    console.error('Erro ao verificar líder de ministério:', error)
    return false
  }
}

/**
 * Verifica se um membro (via token JWT) é dizimista ou ofertante
 */
export async function checkTitherOrGiver(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.substring(7)
    const { verifyMemberToken } = await import('./auth')
    const payload = verifyMemberToken(token)
    
    if (!payload || !payload.memberId) {
      return false
    }

    return await isTitherOrGiver(payload.memberId, prisma)
  } catch (error) {
    console.error('Erro ao verificar dizimista/ofertante:', error)
    return false
  }
}

/**
 * Verifica se um membro (via token JWT) tem acesso ao Portal de Transparência
 * Acesso: membros ativos que são dizimistas ou ofertantes
 */
export async function checkTransparencyAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.substring(7)
    const { verifyMemberToken } = await import('./auth')
    const payload = verifyMemberToken(token)
    
    if (!payload || !payload.memberId) {
      return false
    }

    // Verificar se o membro está ativo
    const member = await prisma.member.findUnique({
      where: { id: payload.memberId },
      select: { status: true, deletedAt: true },
    })

    if (!member || member.deletedAt || member.status !== 'ACTIVE') {
      return false
    }

    // Verificar se é dizimista ou ofertante
    return await isTitherOrGiver(payload.memberId, prisma)
  } catch (error) {
    console.error('Erro ao verificar acesso à transparência:', error)
    return false
  }
}

