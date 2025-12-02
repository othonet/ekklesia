/**
 * Hook para gerenciar cache de dados da API no desktop
 */
import { useState, useEffect, useCallback } from 'react'

const CACHE_PREFIX = 'ekklesia_cache_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    cacheDuration?: number
    skipCache?: boolean
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const cacheKey = `${CACHE_PREFIX}${key}`
  const cacheDuration = options?.cacheDuration || CACHE_DURATION
  const enabled = options?.enabled !== false

  const loadFromCache = useCallback((): T | null => {
    try {
      if (typeof window === 'undefined') return null
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const entry: CacheEntry<T> = JSON.parse(cached)
        const now = Date.now()
        
        // Verificar se o cache ainda é válido
        if (now - entry.timestamp < cacheDuration) {
          return entry.data
        } else {
          // Cache expirado, remover
          localStorage.removeItem(cacheKey)
        }
      }
    } catch (e) {
      console.error('Erro ao carregar cache:', e)
    }
    return null
  }, [cacheKey, cacheDuration])

  const saveToCache = useCallback((data: T) => {
    try {
      if (typeof window === 'undefined') return
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(cacheKey, JSON.stringify(entry))
    } catch (e) {
      console.error('Erro ao salvar cache:', e)
    }
  }, [cacheKey])

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!enabled) return

      try {
        setLoading(true)
        setError(null)

        // Tentar carregar do cache primeiro (se não estiver pulando)
        if (!skipCache && !options?.skipCache) {
          const cachedData = loadFromCache()
          if (cachedData) {
            setData(cachedData)
            setLoading(false)
            // Atualizar em background (sem bloquear a UI)
            fetchData(true)
            return
          }
        }

        // Buscar da API
        const freshData = await fetchFn()
        setData(freshData)
        saveToCache(freshData)
      } catch (err) {
        setError(err)
        // Se houver erro e tiver cache, usar cache mesmo expirado
        if (!skipCache) {
          const cachedData = loadFromCache()
          if (cachedData) {
            setData(cachedData)
          }
        }
      } finally {
        setLoading(false)
      }
    },
    // IMPORTANTE: não depender de fetchFn diretamente para evitar loops de renderização
    // O "key" já garante que, se algo relevante mudar, o cache será recarregado.
    [enabled, loadFromCache, saveToCache, options?.skipCache, cacheKey]
  )

  const invalidate = useCallback(() => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(cacheKey)
    } catch (e) {
      console.error('Erro ao invalidar cache:', e)
    }
  }, [cacheKey])

  const refresh = useCallback(async () => {
    invalidate()
    await fetchData(true)
  }, [invalidate, fetchData])

  useEffect(() => {
    fetchData()
    // Disparar quando a chave do cache mudar (por exemplo, filtros, página, etc.)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
  }
}

