// Servicio para manejar submodalidades del chatbot
import { API_CONFIG } from './api-config'
import { authService } from './auth'
import { Submodality, SubmodalityWithCategories } from './modalities'

export interface CreateSubmodalityRequest {
  name: string
  description?: string
  modality_id: string
}

export interface UpdateSubmodalityRequest {
  name?: string
  description?: string
  modality_id?: string
}

class SubmodalityService {
  /**
   * Obtener todas las submodalidades
   */
  async getSubmodalities(): Promise<Submodality[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/submodalities/`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener submodalidades')
      }

      const submodalities: Submodality[] = await response.json()
      return submodalities
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Obtener una submodalidad específica con sus categorías
   */
  async getSubmodality(submodalityId: string): Promise<SubmodalityWithCategories> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/submodalities/${submodalityId}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener submodalidad')
      }

      const submodality: SubmodalityWithCategories = await response.json()
      return submodality
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Crear una nueva submodalidad
   */
  async createSubmodality(submodalityData: CreateSubmodalityRequest): Promise<Submodality> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/submodalities/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submodalityData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear submodalidad')
      }

      const submodality: Submodality = await response.json()
      return submodality
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Actualizar una submodalidad existente
   */
  async updateSubmodality(submodalityId: string, submodalityData: UpdateSubmodalityRequest): Promise<Submodality> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/submodalities/${submodalityId}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submodalityData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al actualizar submodalidad')
      }

      const submodality: Submodality = await response.json()
      return submodality
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Eliminar una submodalidad
   */
  async deleteSubmodality(submodalityId: string): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/submodalities/${submodalityId}/`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al eliminar submodalidad')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Obtener submodalidades filtradas por modalidad
   */
  async getSubmodalitiesByModality(modalityId: string): Promise<Submodality[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/submodalities/?modality_id=${modalityId}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener submodalidades')
      }

      const submodalities: Submodality[] = await response.json()
      return submodalities
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }
}

// Exportar instancia singleton
export const submodalityService = new SubmodalityService()
