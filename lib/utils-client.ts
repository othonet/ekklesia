/**
 * Utilitários para uso no cliente (browser)
 */

export interface UserInfo {
  userId: string
  email: string
  role: string
  churchId?: string
}

/**
 * Decodifica o token JWT para obter informações do usuário
 */
export function getUserFromToken(): UserInfo | null {
  if (typeof window === 'undefined') return null

  try {
    // Tentar obter token do localStorage primeiro
    let token = localStorage.getItem('token')
    
    // Se não encontrar, tentar obter dos cookies baseado no contexto
    if (!token) {
      // Verificar se estamos na plataforma ou no dashboard
      const isPlatform = window.location.pathname.startsWith('/platform')
      const cookieName = isPlatform ? 'platform_token' : 'church_token'
      
      token = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${cookieName}=`))
        ?.split('=')[1] || null
    }

    if (!token) return null

    // Decodificar JWT (apenas payload, sem verificar assinatura)
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      churchId: payload.churchId,
    }
  } catch (error) {
    console.error('Erro ao decodificar token:', error)
    return null
  }
}

/**
 * Verifica se o usuário tem permissão de admin
 */
export function isAdmin(user: UserInfo | null): boolean {
  if (!user) return false
  return user.role === 'ADMIN' || user.role === 'PASTOR'
}

/**
 * Verifica se o usuário tem permissão de líder ou superior
 */
export function isLeaderOrAbove(user: UserInfo | null): boolean {
  if (!user) return false
  return ['ADMIN', 'PASTOR', 'LEADER'].includes(user.role)
}

