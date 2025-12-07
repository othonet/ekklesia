"use client"

import { useCallback } from 'react'
import { toast } from './use-toast'

interface ApiOptions extends RequestInit {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
}

export function useApi() {
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }, [])

  const fetchWithAuth = useCallback(async (
    url: string,
    options: ApiOptions = {}
  ) => {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options

    const token = getToken()

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage = data.error || `Erro ${response.status}: ${response.statusText}`
        
        if (showErrorToast) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: errorMessage,
          })
        }
        
        throw new Error(errorMessage)
      }

      if (showSuccessToast && successMessage) {
        toast({
          variant: 'success',
          title: 'Sucesso',
          description: successMessage,
        })
      }

      return { data, response }
    } catch (error: any) {
      if (showErrorToast && error.message !== 'Failed to fetch') {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: error.message || 'Erro ao processar requisição',
        })
      }
      throw error
    }
  }, [getToken])

  return {
    fetchWithAuth,
    getToken,
  }
}

