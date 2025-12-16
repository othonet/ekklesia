'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromToken } from '@/lib/utils-client'
import { useChurchModules } from '@/lib/module-permissions-client'

/**
 * Hook para proteger páginas que requerem um módulo específico
 * Verifica se o módulo está ativo e redireciona se não estiver
 */
export function useModuleAccessGuard(moduleKey: string) {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const { modules } = useChurchModules()
  const user = getUserFromToken()

  useEffect(() => {
    async function checkAccess() {
      try {
        if (!user || !user.churchId) {
          setHasAccess(false)
          setLoading(false)
          return
        }

        // Verificar se o módulo está na lista de módulos disponíveis
        const normalizedKey = moduleKey.trim().toUpperCase()
        const module = modules.find(
          (m) => m.key.trim().toUpperCase() === normalizedKey
        )

        if (module) {
          setHasAccess(true)
        } else {
          // Se não encontrou na lista, verificar via API
          const token = localStorage.getItem('token')
          const response = await fetch(
            `/api/modules/check?churchId=${user.churchId}&moduleKey=${moduleKey}`,
            {
              headers: { 'Authorization': `Bearer ${token}` },
            }
          )

          if (response.ok) {
            const data = await response.json()
            setHasAccess(data.hasAccess || false)
          } else {
            setHasAccess(false)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar acesso ao módulo:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [moduleKey, modules, user])

  useEffect(() => {
    if (!loading && hasAccess === false) {
      // Redirecionar para o dashboard com mensagem de erro
      router.push('/dashboard?error=module_not_available')
    }
  }, [hasAccess, loading, router])

  return { hasAccess, loading }
}

