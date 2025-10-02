// Servicio para manejar modalidades del chatbot
import { API_CONFIG } from './api-config'
import { authService } from './auth'

// Interfaces para Modalidades
export interface Modality {
  id: string
  name: string
  slug: string
  description: string
  created_at: string
  updated_at: string | null
  total_submodalities: number
  total_categories: number
  total_questions: number
}

export interface Submodality {
  id: string
  name: string
  slug: string
  description: string
  modality_id: string
  created_at: string
  updated_at: string | null
  modality_name: string
  full_name: string
  full_path: string
  total_categories: number
  total_questions: number
}

// Interface para categorías dentro de submodalidades
export interface Category {
  id: string
  name: string
  slug: string
  description: string
  submodality_id: string
  created_at: string
  updated_at: string | null
  submodality_name: string
  modality_name: string
  full_name: string
  full_path: string
  total_questions: number
}

export interface SubmodalityWithCategories extends Submodality {
  categories: Category[]
}

export interface ModalityWithSubmodalities extends Modality {
  submodalities: Submodality[]
}

export interface CreateModalityRequest {
  name: string
  description?: string
}

export interface UpdateModalityRequest {
  name?: string
  description?: string
}

class ModalityService {
  /**
   * Obtener todas las modalidades
   */
  async getModalities(): Promise<Modality[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/modalities`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener modalidades')
      }

      const modalities: Modality[] = await response.json()
      return modalities
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Obtener una modalidad específica con sus submodalidades
   */
  async getModality(modalityId: string): Promise<ModalityWithSubmodalities> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/modalities/${modalityId}/`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener modalidad')
      }

      const modality: ModalityWithSubmodalities = await response.json()
      return modality
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Crear una nueva modalidad
   */
  async createModality(modalityData: CreateModalityRequest): Promise<Modality> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/modalities/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(modalityData),
        }
      )

      if (!response.ok) {
        let errorData: any = {}
        let errorText = ''
        try {
          errorData = await response.json()
        } catch {
          try {
            errorText = await response.text()
          } catch {
            // nothing
          }
        }
        let errorMessage = 'Error desconocido'
        if (errorData.error?.details?.original_detail && typeof errorData.error.details.original_detail === 'string') errorMessage = errorData.error.details.original_detail
        else if (typeof errorData.detail === 'string') errorMessage = errorData.detail
        else if (typeof errorData.message === 'string') errorMessage = errorData.message
        else if (typeof errorData.error === 'string') errorMessage = errorData.error
        else if (errorText) errorMessage = errorText
        else errorMessage = `Error ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const modality: Modality = await response.json()
      return modality
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Actualizar una modalidad existente
   */
  async updateModality(modalityId: string, modalityData: UpdateModalityRequest): Promise<Modality> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/modalities/${modalityId}/`,
        {
          method: 'PUT', // Cambiar de PATCH a PUT según tu API
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(modalityData),
        }
      )

      if (!response.ok) {
        let errorData: any = {}
        let errorText = ''
        try {
          errorData = await response.json()
        } catch {
          try {
            errorText = await response.text()
          } catch {
            // nothing
          }
        }
        let errorMessage = 'Error desconocido'
        if (errorData.error?.details?.original_detail && typeof errorData.error.details.original_detail === 'string') errorMessage = errorData.error.details.original_detail
        else if (typeof errorData.detail === 'string') errorMessage = errorData.detail
        else if (typeof errorData.message === 'string') errorMessage = errorData.message
        else if (typeof errorData.error === 'string') errorMessage = errorData.error
        else if (errorText) errorMessage = errorText
        else errorMessage = `Error ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const modality: Modality = await response.json()
      return modality
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Eliminar una modalidad
   */
  async deleteModality(modalityId: string): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/modalities/${modalityId}/`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al eliminar modalidad')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }
}

// Exportar instancia singleton
export const modalityService = new ModalityService()
