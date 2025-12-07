'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromToken } from '@/lib/utils-client'
import { canAccessRoute } from '@/lib/permissions'

interface RouteGuardProps {
  children: React.ReactNode
  requiredPermission?: string
  fallback?: React.ReactNode
}

/**
 * Componente para proteger rotas no cliente
 * Verifica se o usuário tem permissão para acessar a rota atual
 */
export function RouteGuard({ children, requiredPermission, fallback }: RouteGuardProps) {
  const router = useRouter()
  const user = getUserFromToken()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Se tiver permissão específica requerida, verificar
    if (requiredPermission) {
      const { hasPermission } = require('@/lib/permissions')
      if (!hasPermission(user.role, requiredPermission as any)) {
        router.push('/dashboard')
        return
      }
    }

    // Verificar acesso à rota atual
    const currentPath = window.location.pathname
    if (!canAccessRoute(user.role, currentPath)) {
      router.push('/dashboard')
    }
  }, [user, router, requiredPermission])

  if (!user) {
    return fallback || <div>Carregando...</div>
  }

  // Verificar permissão específica se fornecida
  if (requiredPermission) {
    const { hasPermission } = require('@/lib/permissions')
    if (!hasPermission(user.role, requiredPermission as any)) {
      return fallback || <div>Acesso negado</div>
    }
  }

  // Verificar acesso à rota atual
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  if (currentPath && !canAccessRoute(user.role, currentPath)) {
    return fallback || <div>Acesso negado</div>
  }

  return <>{children}</>
}

