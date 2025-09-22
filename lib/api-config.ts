// Configuración de la API del chatbot
export const API_CONFIG = {
  // URL base de la API
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:8000',
  
  // Endpoints
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/auth/token',
    REFRESH: '/auth/refresh/',
    PASSWORD_RESET_REQUEST: '/auth/password-reset-request',
    PASSWORD_RESET: '/auth/password-reset',
    
    // Chatbot
    QUESTIONS: '/chat/questions/',
    QUESTIONS_NO_SLASH: '/chat/questions',
    CATEGORIES: '/chat/categories/',
  },
  
  // Configuración de timeout (en milisegundos)
  TIMEOUT: 30000,
  
  // Timeout extendido para operaciones que requieren regeneración de IA (en milisegundos)
  EXTENDED_TIMEOUT: 60000, // 60 segundos para regeneración de respuestas
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
} as const

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Función helper para manejar errores de la API
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Error desconocido al comunicarse con la API'
}
