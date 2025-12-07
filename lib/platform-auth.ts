import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

/**
 * Verifica se o usuário é um super administrador da plataforma
 * Apenas usuários com role ADMIN podem acessar a plataforma multitenancy
 */
export async function isPlatformAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Usar platform_token para a plataforma
    const token = request.cookies.get('platform_token')?.value
    if (!token) return false

    const payload = verifyToken(token)
    if (!payload) return false

    // Verificar se o usuário tem isPlatformAdmin = true no banco
    const { prisma } = await import('./prisma')
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isPlatformAdmin: true, active: true },
    })

    if (!user || !user.active) return false

    // Apenas usuários com isPlatformAdmin = true podem acessar
    return user.isPlatformAdmin === true
  } catch {
    return false
  }
}

/**
 * Verifica se o usuário é administrador ou pastor da igreja
 * Permite acesso à administração da igreja (dashboard)
 */
export async function isChurchAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Usar church_token para a administração da igreja
    const token = request.cookies.get('church_token')?.value
    if (!token) return false

    const payload = verifyToken(token)
    if (!payload) return false

    // ADMIN, PASTOR e LEADER podem acessar o dashboard da igreja
    return ['ADMIN', 'PASTOR', 'LEADER'].includes(payload.role)
  } catch {
    return false
  }
}

