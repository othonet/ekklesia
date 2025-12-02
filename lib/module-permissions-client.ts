'use client'

import { useEffect, useState } from 'react'
import { getUserFromToken } from './utils-client'

/**
 * Hook para verificar se o usuário tem acesso a um módulo
 */
export function useModuleAccess(moduleKey: string) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      try {
        const user = getUserFromToken()
        if (!user || !user.churchId) {
          setHasAccess(false)
          setLoading(false)
          return
        }

        const response = await fetch(
          `/api/modules/check?churchId=${user.churchId}&moduleKey=${moduleKey}`
        )

        if (response.ok) {
          const data = await response.json()
          setHasAccess(data.hasAccess)
        } else {
          setHasAccess(false)
        }
      } catch (error) {
        console.error('Erro ao verificar acesso ao módulo:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [moduleKey])

  return { hasAccess, loading }
}

/**
 * Hook para obter todos os módulos disponíveis para a igreja do usuário
 */
export function useChurchModules() {
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchModules() {
      try {
        const user = getUserFromToken()
        if (!user || !user.churchId) {
          setModules([])
          setLoading(false)
          return
        }

        const response = await fetch(`/api/modules/church/${user.churchId}`)

        if (response.ok) {
          const data = await response.json()
          setModules(data.modules || [])
        } else {
          setModules([])
        }
      } catch (error) {
        console.error('Erro ao obter módulos:', error)
        setModules([])
      } finally {
        setLoading(false)
      }
    }

    fetchModules()
  }, [])

  return { modules, loading }
}

