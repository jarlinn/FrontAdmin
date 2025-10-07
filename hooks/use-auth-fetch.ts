import { useState, useCallback } from 'react'
import { authService } from '@/lib/auth'

interface UseAuthFetchOptions {
  onError?: (error: string) => void
  onSuccess?: (data: any) => void
}

interface UseAuthFetchReturn {
  data: any
  loading: boolean
  error: string | null
  fetchData: (url: string, options?: RequestInit) => Promise<any>
  clearError: () => void
}

/**
 * Hook personalizado para hacer requests autenticados
 * Maneja automáticamente el refresh de tokens y errores de autenticación
 */
export function useAuthFetch(options: UseAuthFetchOptions = {}): UseAuthFetchReturn {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { onError, onSuccess } = options

  const fetchData = useCallback(async (url: string, requestOptions: RequestInit = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authService.authenticatedFetch(url, requestOptions)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        throw error
      }

      const responseData = await response.json()
      setData(responseData)
      
      if (onSuccess) {
        onSuccess(responseData)
      }

      return responseData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [onError, onSuccess])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    data,
    loading,
    error,
    fetchData,
    clearError,
  }
}

/**
 * Hook específico para operaciones CRUD
 */
export function useAuthCrud<T = any>(baseUrl: string) {
  const { fetchData, loading, error, clearError } = useAuthFetch()

  const create = useCallback(async (data: Partial<T>): Promise<T> => {
    return fetchData(baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }, [fetchData, baseUrl])

  const read = useCallback(async (id?: string | number): Promise<T | T[]> => {
    const url = id ? `${baseUrl}/${id}` : baseUrl
    return fetchData(url)
  }, [fetchData, baseUrl])

  const update = useCallback(async (id: string | number, data: Partial<T>): Promise<T> => {
    return fetchData(`${baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }, [fetchData, baseUrl])

  const remove = useCallback(async (id: string | number): Promise<void> => {
    return fetchData(`${baseUrl}/${id}`, {
      method: 'DELETE',
    })
  }, [fetchData, baseUrl])

  return {
    create,
    read,
    update,
    remove,
    loading,
    error,
    clearError,
  }
}
