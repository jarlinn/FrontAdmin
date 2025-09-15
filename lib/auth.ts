// Servicio de autenticación con manejo de tokens
import { API_CONFIG } from './api-config'
import { isTokenExpired, shouldRefreshToken } from './token-utils'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

export interface User {
  email: string
  // Agregar más campos según la respuesta de tu API
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  new_password: string
}

class AuthService {
  private readonly TOKEN_KEY = 'access_token'
  private readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry'

  /**
   * Realizar login con credenciales
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al iniciar sesión')
      }

      const authData: AuthResponse = await response.json()
      
      // Guardar tokens
      this.setTokens(authData)
      
      return authData
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(): Promise<AuthResponse | null> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      console.warn('No refresh token available')
      return null
    }

    try {
      console.log('Attempting to refresh token...')
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
      })

      if (!response.ok) {
        console.error('Refresh token failed:', response.status, response.statusText)
        // Si el refresh falla, limpiar tokens
        this.clearTokens()
        return null
      }

      const authData: AuthResponse = await response.json()
      console.log('Token refreshed successfully')
      
      // Guardar los nuevos tokens
      this.setTokens(authData)
      
      return authData
    } catch (error) {
      console.error('Error refreshing token:', error)
      this.clearTokens()
      return null
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearTokens()
    // Redirigir al login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PASSWORD_RESET_REQUEST}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al solicitar recuperación de contraseña')
      }

      // La API puede devolver un mensaje de confirmación o simplemente 200 OK
      console.log('Password reset request sent successfully')
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Resetear contraseña con token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PASSWORD_RESET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al resetear la contraseña')
      }

      console.log('Password reset successfully')
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  /**
   * Obtener token de refresh
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    // Verificar si el token ha expirado
    return !this.isTokenExpired()
  }

  /**
   * Verificar si el token ha expirado
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken()
    if (!token) return true

    return isTokenExpired(token)
  }

  /**
   * Verificar si el token necesita ser refrescado
   */
  shouldRefreshToken(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    return shouldRefreshToken(token)
  }

  /**
   * Obtener tiempo de expiración del token (legacy - mantener por compatibilidad)
   */
  private getTokenExpiry(): number | null {
    if (typeof window === 'undefined') return null
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
    return expiry ? parseInt(expiry, 10) : null
  }

  /**
   * Guardar tokens en localStorage
   */
  private setTokens(authData: AuthResponse): void {
    if (typeof window === 'undefined') return

    console.log('Saving tokens...', {
      hasAccessToken: !!authData.access_token,
      hasRefreshToken: !!authData.refresh_token,
      expiresIn: authData.expires_in
    })

    // Guardar access token
    localStorage.setItem(this.TOKEN_KEY, authData.access_token)
    
    // Guardar refresh token (ahora es obligatorio según la API)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refresh_token)

    // Calcular tiempo de expiración usando expires_in de la respuesta
    const expiresIn = authData.expires_in // en segundos
    const expiryTime = Date.now() + (expiresIn * 1000)
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString())

    // También guardar en cookies para el middleware
    // Usar httpOnly=false para que JavaScript pueda acceder (necesario para el middleware)
    document.cookie = `token=${authData.access_token}; path=/; samesite=strict; max-age=${expiresIn}`
    
    console.log('Tokens saved successfully')
  }

  /**
   * Limpiar todos los tokens
   */
  private clearTokens(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
    
    // Limpiar cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
  }

  /**
   * Obtener headers de autorización para requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken()
    if (!token) return {}

    return {
      'Authorization': `Bearer ${token}`
    }
  }

  /**
   * Hacer request autenticado con manejo automático de refresh
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Verificar si el token necesita ser refrescado (antes de que expire)
    if (this.shouldRefreshToken()) {
      console.log('Token needs refresh, attempting refresh...')
      const refreshed = await this.refreshToken()
      if (!refreshed) {
        console.error('Failed to refresh token, logging out')
        this.logout()
        throw new Error('Sesión expirada')
      }
    }

    // Si el token ya expiró, intentar refrescarlo
    if (this.isTokenExpired()) {
      console.log('Token expired, attempting refresh...')
      const refreshed = await this.refreshToken()
      if (!refreshed) {
        console.error('Failed to refresh expired token, logging out')
        this.logout()
        throw new Error('Sesión expirada')
      }
    }

    // Agregar headers de autorización
    const authHeaders = this.getAuthHeaders()
    
    // Manejar FormData (no agregar Content-Type)
    const isFormData = options.body instanceof FormData
    const headers = isFormData 
      ? {
          ...authHeaders,
          ...options.headers,
        }
      : {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...authHeaders,
          ...options.headers,
        }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Si recibimos 401, intentar refrescar el token una vez más
    if (response.status === 401) {
      console.log('Received 401, attempting token refresh...')
      const refreshed = await this.refreshToken()
      if (refreshed) {
        // Reintentar la request con el nuevo token
        const newAuthHeaders = this.getAuthHeaders()
        const newHeaders = isFormData 
          ? {
              ...newAuthHeaders,
              ...options.headers,
            }
          : {
              ...API_CONFIG.DEFAULT_HEADERS,
              ...newAuthHeaders,
              ...options.headers,
            }

        console.log('Retrying request with new token...')
        return fetch(url, {
          ...options,
          headers: newHeaders,
        })
      } else {
        console.error('Failed to refresh token after 401, logging out')
        this.logout()
        throw new Error('Sesión expirada')
      }
    }

    return response
  }
}

// Exportar instancia singleton
export const authService = new AuthService()

// Hook para usar en componentes React
export const useAuth = () => {
  return {
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    requestPasswordReset: authService.requestPasswordReset.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),
    getAccessToken: authService.getAccessToken.bind(authService),
    authenticatedFetch: authService.authenticatedFetch.bind(authService),
  }
}
