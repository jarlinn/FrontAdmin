// Servicio para manejar categorías del nuevo sistema jerárquico
import { API_CONFIG } from './api-config'
import { authService } from './auth'

// Interface para las nuevas categorías del sistema jerárquico
export interface NewCategory {
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

export interface CreateNewCategoryRequest {
  name: string
  description?: string
  submodality_id: string
}

export interface UpdateNewCategoryRequest {
  name?: string
  description?: string
  submodality_id?: string
}

class NewCategoryService {
  /**
   * Obtener todas las categorías del nuevo sistema
   */
  async getNewCategories(): Promise<NewCategory[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/categories/`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener categorías')
      }

      const categories: NewCategory[] = await response.json()
      return categories
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Obtener una categoría específica por ID
   */
  async getNewCategory(categoryId: string): Promise<NewCategory> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/categories/${categoryId}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener categoría')
      }

      const category: NewCategory = await response.json()
      return category
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Crear una nueva categoría
   */
  async createNewCategory(categoryData: CreateNewCategoryRequest): Promise<NewCategory> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/categories/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
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

      const category: NewCategory = await response.json()
      return category
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Actualizar una categoría existente
   */
  async updateNewCategory(categoryId: string, categoryData: UpdateNewCategoryRequest): Promise<NewCategory> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/categories/${categoryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
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

      const category: NewCategory = await response.json()
      return category
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Eliminar una categoría
   */
  async deleteNewCategory(categoryId: string): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/categories/${categoryId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al eliminar categoría')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Obtener categorías filtradas por submodalidad
   */
  async getCategoriesBySubmodality(submodalityId: string): Promise<NewCategory[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/categories/?submodality_id=${submodalityId}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener categorías')
      }

      const categories: NewCategory[] = await response.json()
      return categories
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }
}

// Exportar instancia singleton
export const newCategoryService = new NewCategoryService()
