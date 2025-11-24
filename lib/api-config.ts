// Configuración de la API del chatbot
const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL

  if (envUrl) {
    // Forzar HTTPS si la URL comienza con http://
    const forcedHttpsUrl = envUrl.startsWith('http://') ? envUrl.replace('http://', 'https://') : envUrl
    console.log('API BASE_URL (forced HTTPS):', forcedHttpsUrl)
    return forcedHttpsUrl
  }

  // Fallback para desarrollo local
  const fallbackUrl = 'http://0.0.0.0:8000'
  console.log('API BASE_URL (fallback):', fallbackUrl)
  return fallbackUrl
}

export const API_CONFIG = {
  // URL base de la API
  BASE_URL: getBaseUrl(),
  
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
    DOCUMENTS: '/chat/documents',
    CATEGORIES: '/chat/categories/',
    REPORTS_FREQUENT_QUESTIONS_DOWNLOAD: '/chat/reports/frequent-questions/download',
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
