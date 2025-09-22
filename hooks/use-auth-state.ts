import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/lib/auth'

interface UseAuthStateReturn {
  isAuthenticated: boolean
  isLoading: boolean
  checkAuth: () => void
}

/**
 * Hook optimizado para manejar el estado de autenticación
 * Evita verificaciones innecesarias y mejora el rendimiento
 */
export function useAuthState(): UseAuthStateReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(() => {
    try {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
    } catch (error) {
      console.error('Error checking authentication:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  }
}
