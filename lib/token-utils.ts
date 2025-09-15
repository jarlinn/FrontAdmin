/**
 * Utilidades para manejo de tokens JWT
 */

interface JWTPayload {
  exp?: number
  iat?: number
  sub?: string
  [key: string]: any
}

/**
 * Decodifica un token JWT sin verificar la firma
 * Solo para leer el payload y verificar expiración
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    return null
  }
}

/**
 * Verifica si un token JWT ha expirado
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return true
  }

  // exp está en segundos, Date.now() está en milisegundos
  return Date.now() >= payload.exp * 1000
}

/**
 * Obtiene el tiempo restante hasta la expiración del token en milisegundos
 */
export function getTokenTimeToExpiry(token: string): number {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return 0
  }

  const expiryTime = payload.exp * 1000
  const currentTime = Date.now()
  
  return Math.max(0, expiryTime - currentTime)
}

/**
 * Verifica si un token necesita ser refrescado
 * (si expira en menos de 5 minutos)
 */
export function shouldRefreshToken(token: string): boolean {
  const timeToExpiry = getTokenTimeToExpiry(token)
  const fiveMinutes = 5 * 60 * 1000 // 5 minutos en milisegundos
  
  return timeToExpiry < fiveMinutes && timeToExpiry > 0
}
