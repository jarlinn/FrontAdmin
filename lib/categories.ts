// Servicio para manejar categorías del chatbot
import { API_CONFIG } from './api-config'
import { authService } from './auth'

export interface Category {
  id: string
  name: string
  display_name?: string
  description?: string
  parent_id?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  parent_id?: string | null
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  parent_id?: string | null
  is_active?: boolean
}

export interface CategoryTree {
  id: string
  name: string
  slug: string
  description?: string
  level: number
  is_active: boolean
  full_path: string
  children: CategoryTree[]
  questions_count: number
}

class CategoryService {
  /**
   * Obtener todas las categorías
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener categorías')
      }

      const categories: Category[] = await response.json()
      return categories
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Obtener categorías en formato árbol
   */
  async getCategoriesTree(): Promise<CategoryTree[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}/chat/categories/tree`
      const response = await authService.authenticatedFetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener árbol de categorías')
      }

      const categoriesTree: CategoryTree[] = await response.json()
      return categoriesTree
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
  async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`,
        {
          method: 'POST',
          body: JSON.stringify(categoryData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear categoría')
      }

      const category: Category = await response.json()
      return category
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Actualizar una categoría
   */
  async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/`,
        {
          method: 'PUT',
          body: JSON.stringify(categoryData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al actualizar categoría')
      }

      const category: Category = await response.json()
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
  async deleteCategory(id: string): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}${id}/`,
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
}

// Exportar instancia singleton
export const categoryService = new CategoryService()

// Hook para usar en componentes React
export const useCategories = () => {
  return {
    getCategories: categoryService.getCategories.bind(categoryService),
    createCategory: categoryService.createCategory.bind(categoryService),
    updateCategory: categoryService.updateCategory.bind(categoryService),
    deleteCategory: categoryService.deleteCategory.bind(categoryService),
  }
}

